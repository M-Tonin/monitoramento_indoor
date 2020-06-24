#Esta é uma biblioteca básica para a criação do json 
#que será enviado para a aplicação

#Importando a biblioteca de tratamento mySql_Server
import mySql_Server as sql
#Importando o módulo timedelta da biblioteca datetime
from datetime import timedelta

#CLASSES
class DispositivoEnvio:
    def __init__(self, idD = None, noLoc = None, noDisp = None, stLum = ''):
        self.idDispositivo = idD
        self.localDispositivo = noLoc
        self.nomeDispositivo = noDisp
        self.statusLuminosidade = stLum
        
class OcorrenciaEnvio:
    def __init__(self,vlTmp = None,hrReg = None,dtReg = None):
        self.temperatura = vlTmp
        self.horaRegistrada = hrReg
        self.dataRegistro = dtReg
                
class OcorrenciasJsonPkg:
    def __init__(self,ocs = []):
        self.ocorrencias = ocs
        
class DispositivosJsonPkg:
    def __init__(self,dps = []):
        self.dispositivos = dps
        
class UltTempJsonPkg:
    def __init__(self,ultTemp = None,idD = None):
        self.ultimaTemperatura = ultTemp
        
class DiffTempHoraJsonPkg:
    def __init__(self,diffTemp = None,diffHr = None):
        self.diferencaTemperatura = diffTemp
        self.diferencaMin = diffHr
        
class FreqDispJsonPkg:
    def __init__(self,freqDisp = None):
        self.frequenciaDoDispositivo = freqDisp

#FIM DAS CLASSES


#FUNCTIONS

#Esta função gera um objeto contendo dicionários com os dados da tabela de ocorrências 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_ocorrencia
#   Retorno: um objeto com os dicionários
def generateOcorrenciaPkg(res):
    ocJsonPkg = OcorrenciasJsonPkg()
    for row in res:       
        oc = OcorrenciaEnvio(float(row[2]),str(row[4]),str(row[5]))
        ocJsonPkg.ocorrencias.append(vars(oc))
    return ocJsonPkg


#Esta função gera um objeto contendo dicionários com os dados da tabela de dispositivos 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_dispositivo e tb_ocorrencia,
#               com o status da luminosidade de cada dispositivo
#   Retorno: um objeto com os dicionários    
def generateDispositivosPkg(res):
    dpJsonPkg = DispositivosJsonPkg()
    for row in res:       
        dp = DispositivoEnvio(row[0],str(row[1]),str(row[2]), str(row[6]))
        dpJsonPkg.dispositivos.append(vars(dp))
    return dpJsonPkg
    

#Esta função gera um objeto contendo um dicionário com o valor a última temperatura 
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_ocorrencia, com a temperatura da
#                última ocorrência
#   Retorno: um objeto com o dicionário     
def generateUltTempJsonPkg(res):
    ultTempJsonPkg = UltTempJsonPkg()
    for row in res:
        ultTempJsonPkg.ultimaTemperatura = float(row[0])
    return ultTempJsonPkg


#Esta função gera um objeto contendo um dicionário com o valor da diferença entra as temperaturas e o tempo
#em minutos da ultima ocorrência de cada dispositivo
#   Parâmetros: resultado de uma pesquisa 'SELECT' com 'UNION ALL'na tabela tb_ocorrencia, com os valores de
#               de temperatura e hora da última ocorrência de cada dispositivo
#   Retorno: um objeto com o dicionário      
def generateDiffTempJsonPkg(res):
    diffTempJsonPkg = DiffTempHoraJsonPkg()
    i = 0
    for i in range(0,len(res),1):
        if(i > 0):
            diffTempJsonPkg.diferencaTemperatura = round(abs(float(res[i][0]) - float(res[i - 1][0])),1)
            diffTempJsonPkg.diferencaMin = int(round(abs(int(timedelta.total_seconds(res[i][1] - res[i - 1][1])) / 60),0))
    return diffTempJsonPkg


#Esta função gera um objeto contendo um dicionário com o valor da frequência de envio de um dispositivo
#   Parâmetros: resultado de uma pesquisa 'SELECT' na tabela tb_dispositivo, com a frequência de envio
#   Retorno: um objeto com o dicionário  
def generateFreqDispJsonPkg(res):
    freqDispJsonPkg = FreqDispJsonPkg()
    for row in res:
        freqDispJsonPkg.frequenciaDoDispositivo = float(row[0])
    return freqDispJsonPkg
    
    
#Esta função concatena uma lista de dicionários para a serialização JSON
#   Parâmetros: uma lista de dicionários de objetos
#   Retorno: os dicionários concatenados

def concatDicts (listaDicts):
    allDicts = {}
    for dicio in listaDicts:
        allDicts.update(dicio)
    return allDicts
    
#FIM DAS FUNCTIONS