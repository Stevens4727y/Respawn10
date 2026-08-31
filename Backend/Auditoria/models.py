from django.db import models


class RegistroAuditoria(models.Model):
	usuario_email = models.EmailField(blank=True)
	usuario_nombre = models.CharField(max_length=201, blank=True)
	rol = models.CharField(max_length=50, blank=True)
	departamento = models.CharField(max_length=100, blank=True)
	institucion = models.CharField(max_length=200, blank=True)
	accion = models.CharField(max_length=30)
	modulo = models.CharField(max_length=100)
	modelo = models.CharField(max_length=100, blank=True)
	objeto_id = models.CharField(max_length=100, blank=True)
	descripcion = models.TextField(blank=True)
	direccion_ip = models.GenericIPAddressField(blank=True, null=True)
	fecha = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'registro_auditoria'
		ordering = ['-fecha']

	def __str__(self):
		return f'{self.accion} - {self.modulo} - {self.fecha}'
