from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404
from .models import Evento, Opcao, Eleitor, Voto

api = NinjaAPI(title="CliqueVoto API")

class VotoSchema(Schema):
    evento_id: str
    opcao_id: int
    cpf_eleitor: str

@api.get("/eleicoes/ativas")
def listar_eleicoes_ativas(request):
    eventos = Evento.objects.filter(is_ativo=True)
    return [
        {
            "id": str(e.id), 
            "titulo": e.titulo, 
            "organizacao_nome": e.organizacao.nome,
            "logo_url": e.organizacao.logo_url,    # <-- Campo novo!
            "mostrar_fotos": e.mostrar_fotos       # <-- Campo novo!
        } 
        for e in eventos
    ]

@api.get("/eleicoes/{evento_id}/opcoes")
def listar_opcoes(request, evento_id: str):
    opcoes = Opcao.objects.filter(evento_id=evento_id)
    return [
        {
            "id": o.id, 
            "nome": o.nome, 
            "numero": o.numero,
            "foto_url": o.foto_url                 # <-- Campo novo!
        } 
        for o in opcoes
    ]

@api.post("/votar")
def registrar_voto(request, payload: VotoSchema):
    eleitor = Eleitor.objects.filter(evento_id=payload.evento_id, cpf=payload.cpf_eleitor).first()

    if not eleitor:
        return api.create_response(request, {"erro": "CPF não autorizado para este evento."}, status=403)

    if eleitor.token_utilizado:
        return api.create_response(request, {"erro": "Voto já registrado para este CPF."}, status=400)

    Voto.objects.create(evento_id=payload.evento_id, opcao_id=payload.opcao_id)

    eleitor.token_utilizado = True
    eleitor.save()

    return {"sucesso": True, "mensagem": "Voto computado com sucesso!"}
