import os
import django

# Configuração do ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from votacao.models import Organizacao, TipoEvento, Evento, Enquete, Eleitor, Opcao

def popular_banco():
    print("🚀 Iniciando carga de teste...")

    # 1. Criar Organização
    org, _ = Organizacao.objects.get_or_create(
        nome="Condomínio Madri III",
        defaults={'logo_url': "https://cdn-icons-png.flaticon.com/512/609/609803.png"}
    )

    # 2. Criar Tipo de Evento
    tipo, _ = TipoEvento.objects.get_or_create(nome="Assembleia Geral Ordinária")

    # 3. Criar Evento (O "Show")
    from django.utils import timezone
    from datetime import timedelta
    
    evento, created = Evento.objects.get_or_create(
        titulo="Assembleia Geral 2026 - Madri III",
        defaults={
            'organizacao': org,
            'tipo': tipo,
            'mensagem_boas_vindas': "Sejam bem-vindos à Assembleia Geral do Condomínio Madri III. Sua participação é fundamental para as decisões do nosso ano.",
            'link_termos': "https://www.google.com.br",
            'data_inicio': timezone.now(),
            'data_fim': timezone.now() + timedelta(days=1),
            'is_ativo': True,
            'mostrar_fotos': True
        }
    )

    # 4. Criar Pautas (Enquetes)
    # Pauta 1: Automática (Sim/Não/Abster)
    pauta1, _ = Enquete.objects.get_or_create(
        evento=evento,
        titulo="Aprovação das contas do exercício 2025",
        tipo_enquete="aprovacao",
        status="em_votacao"
    )

    # Pauta 2: Candidatos (Manual)
    pauta2, _ = Enquete.objects.get_or_create(
        evento=evento,
        titulo="Eleição de Novo Síndico (Gestão 2026-2027)",
        tipo_enquete="candidatos",
        status="em_votacao"
    )
    
    if not Opcao.objects.filter(enquete=pauta2).exists():
        Opcao.objects.create(enquete=pauta2, nome="Phelipe (Chapa 01)", numero=10)
        Opcao.objects.create(enquete=pauta2, nome="João (Chapa 02)", numero=20)

    # 5. Criar Eleitor de Teste (VOCÊ!)
    Eleitor.objects.get_or_create(
        evento=evento,
        cpf="12345678901", # Substitua pelo seu CPF de teste se quiser
        defaults={
            'nome': "Phelipe Especialista",
            'status': 'aprovado'
        }
    )

    print("✅ Banco populado com sucesso!")
    print(f"🔗 Evento ID: {evento.id}")

if __name__ == "__main__":
    popular_banco()