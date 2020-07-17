# Servidor e Banco de Dados

## Responsáveis:
* Fernando, Renato e Saulo.
-------------
## Overview:
* Servidor em Flask / Python;
* Banco de Dados local em MySQL.
-------------
## Recursos utilizados:
* Python;
  * Flask;
  * Protocolo HTTP;
* ngrok;
* MySQL;
* Workbench;
* TTN;
  * Protocolo MQTT.
-------------
## Pontes de comunicação do servidor:
<img src="/Imagens/pontes de conexão do servidor.png" width="612" height="480"/>

-------------
## Arquivos desenvolvidos pela equipe:
* server.py
  * Programa servidor em si, que realiza todas as pontes de comunicação entre os dispositivos, o aplicativo e o banco de dados.
* server_utils.py
  * Biblioteca auxiliar desenvolvida para externalizar chamadas de funções de outras bibliotecas, operações de bytes, preparação de pacotes para envios, setups de conexões e afins do programa do servidor, afim de deixá-lo mais enxuto e de fácil leitura e compreensão.
* mySqlLib_Server.py
  * Biblioteca com todos os recursos necessários para a utilização das operações MySQL que o servidor precisa para se comunicar com o banco de dados.
* dictTreatLib_Server.py
  * Biblioteca auxiliar que faz o tratamento de dados retirados do banco de dados para serem enviados à aplicação de forma que facilite a leitura dos mesmos.

-------------
## Banco de Dados
* tb_dispositivo - Mantém o cadastro dos dispositivos de captura indoor, com indicativos de frequência de leitura, valor mínimo de luminosidade, status de ativo e  Inativo e temperatura, sua identificação e localização.
* tb_ocorrencia - Mantém o cadastro de todas as ocorrências/medições por dispositivo, armazenando por dia e hora o valor da  luminosidade  e da temperatura.
* tb_parametro - Mantém o cadastro do intervalo para futuras medições e ou análises.
<img src="/Imagens/tabelas.png" width="523" height="471"/>

Mais informações a respeito do banco de dados no arquivo "Documentação_Modelagem.txt".
