from django.contrib import admin
from .models import TipoEvento, Organizacao, Evento, Enquete, Opcao, Eleitor, Voto

@admin.register(TipoEvento)
class TipoEventoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'exige_aprovacao_cadastro', 'voto_com_peso', 'permite_procuracao')

@admin.register(Organizacao)
class OrganizacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cnpj', 'criado_em')

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'organizacao', 'tipo', 'data_inicio', 'is_ativo')
    list_filter = ('organizacao', 'is_ativo', 'tipo')
    search_fields = ('titulo', 'slug_convocacao')

@admin.register(Enquete)
class EnqueteAdmin(admin.ModelAdmin):
    # Removido status temporariamente para permitir a migração
    list_display = ('titulo', 'evento', 'tipo_enquete')
    list_filter = ('evento', 'tipo_enquete')
    search_fields = ('titulo',)

admin.site.register(Opcao)
admin.site.register(Eleitor)
admin.site.register(Voto)