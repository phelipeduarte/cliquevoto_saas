from django.contrib import admin
from .models import Organizacao, Evento, Opcao, Eleitor, Voto

@admin.register(Organizacao)
class OrganizacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cnpj', 'criado_em')
    search_fields = ('nome', 'cnpj')

@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'organizacao', 'data_inicio', 'data_fim', 'is_ativo')
    list_filter = ('is_ativo', 'organizacao')
    search_fields = ('titulo',)

@admin.register(Opcao)
class OpcaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'evento', 'numero')
    list_filter = ('evento',)

@admin.register(Eleitor)
class EleitorAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'evento', 'token_utilizado')
    list_filter = ('token_utilizado', 'evento')
    search_fields = ('nome', 'cpf')

@admin.register(Voto)
class VotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'evento', 'opcao', 'data_hora')
    list_filter = ('evento',)
    # O Eleitor não aparece aqui propositalmente. O sigilo do voto está garantido pela arquitetura.
