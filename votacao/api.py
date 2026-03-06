from typing import List
from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404
from .models import Evento, Enquete, Opcao, Eleitor, Voto
from django.db.models import Count
from django.db import transaction

api = NinjaAPI(title="CliqueVoto API")

# ==========================================
# SCHEMAS DE VALIDAÇÃO (Voto em Lote)
# ==========================================
class VotoIndividual(Schema):
    enquete_id: int
    opcao_id: int

class VotoLoteSchema(Schema):
    evento_id: str
    cpf_eleitor: str
    votos: List[VotoIndividual]

# ==========================================
# ENDPOINTS
# ==========================================
@api.get("/eleicoes/ativas")
def listar_eleicoes_ativas(request):
    eventos = Evento.objects.filter(is_ativo=True)
    return [
        {
            "id": str(e.id), 
            "titulo": e.titulo, 
            "organizacao_nome": e.organizacao.nome,
            "logo_url": e.organizacao.logo_url,
            "mostrar_fotos": e.mostrar_fotos,
            "mensagem_boas_vindas": e.mensagem_boas_vindas,
            "link_termos": e.link_termos
        } 
        for e in eventos
    ]

@api.get("/eleicoes/{evento_id}/enquetes")
def listar_enquetes(request, evento_id: str):
    enquetes = Enquete.objects.filter(evento_id=evento_id).prefetch_related('opcoes')
    return [
        {
            "id": eq.id, 
            "titulo": eq.titulo, 
            "tipo_enquete": eq.tipo_enquete,
            "status": eq.status,
            "opcoes": [
                {
                    "id": o.id, 
                    "nome": o.nome, 
                    "numero": o.numero,
                    "foto_url": o.foto_url
                } for o in eq.opcoes.all()
            ]
        } 
        for eq in enquetes
    ]

@api.post("/votar")
def registrar_votos(request, payload: VotoLoteSchema):
    eleitor = Eleitor.objects.filter(evento_id=payload.evento_id, cpf=payload.cpf_eleitor).first()

    if not eleitor:
        return api.create_response(request, {"erro": "CPF não autorizado para este evento."}, status=403)

    if eleitor.token_utilizado:
        return api.create_response(request, {"erro": "Votos já registrados para este CPF."}, status=400)

    with transaction.atomic():
        for voto in payload.votos:
            Voto.objects.create(enquete_id=voto.enquete_id, opcao_id=voto.opcao_id)
        
        eleitor.token_utilizado = True
        eleitor.save()

    return {"sucesso": True, "mensagem": "Votos computados com sucesso!"}

@api.get("/eleicoes/{evento_id}/resultados")
def ver_resultados(request, evento_id: str):
    enquetes = Enquete.objects.filter(evento_id=evento_id).prefetch_related('opcoes')
    resultados_enquetes = []
    
    for eq in enquetes:
        total_enquete = Voto.objects.filter(enquete_id=eq.id).count()
        opcoes_data = []
        
        opcoes_com_votos = eq.opcoes.annotate(total_votos=Count('voto')).order_by('-total_votos')
        
        for o in opcoes_com_votos:
            opcoes_data.append({
                "nome": o.nome,
                "votos": o.total_votos,
                "porcentagem": round((o.total_votos / total_enquete * 100), 2) if total_enquete > 0 else 0,
                "foto_url": o.foto_url
            })
        
        resultados_enquetes.append({
            "enquete_id": eq.id,
            "titulo": eq.titulo,
            "total_votos": total_enquete,
            "ranking": opcoes_data
        })

    return {
        "resultados_por_enquete": resultados_enquetes
    }