# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Arduino',
            fields=[
                ('id', models.IntegerField(serialize=False, primary_key=True)),
                ('celda', models.IntegerField(default=0)),
                ('sector', models.IntegerField(default=0)),
                ('prueba', models.IntegerField(default=0)),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='arduino',
            unique_together=set([('celda', 'sector')]),
        ),
    ]
