from django.db import models
import uuid

class Organizacao(models.Model):
    nome = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, blank=True, null=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Logo do Cliente (URL)")
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

class Evento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organizacao = models.ForeignKey(Organizacao, on_delete=models.CASCADE, related_name='eventos')
    titulo = models.CharField(max_length=255)
    data_inicio = models.DateTimeField()
    data_fim = models.DateTimeField()
    is_ativo = models.BooleanField(default=True)
    mostrar_fotos = models.BooleanField(default=True, verbose_name="Mostrar fotos dos candidatos na urna?")

    def __str__(self):
        return self.titulo

class Opcao(models.Model):
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='opcoes')
    nome = models.CharField(max_length=255)
    numero = models.IntegerField(blank=True, null=True)
    foto_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Foto do Candidato (URL)")

    def __str__(self):
        return f"{self.nome} - {self.evento.titulo}"

class Eleitor(models.Model):
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='eleitores')
    cpf = models.CharField(max_length=11)
    nome = models.CharField(max_length=255)
    token_utilizado = models.BooleanField(default=False)

    class Meta:
        # Garante que um CPF não seja cadastrado duas vezes no mesmo evento
        unique_together = ('evento', 'cpf')

    def __str__(self):
        return f"{self.nome} ({self.cpf})"

class Voto(models.Model):
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    opcao = models.ForeignKey(Opcao, on_delete=models.CASCADE)
    data_hora = models.DateTimeField(auto_now_add=True)
    
    # ATENÇÃO ARQUITETURAL: Não existe Foreign Key para o Eleitor aqui.
    # Isso garante matematicamente o sigilo do voto.

    def __str__(self):
        return f"Voto computado - {self.evento.titulo}"