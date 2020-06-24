#Esta é uma biblioteca básica que trata das conexões com o banco de dados MySql
#e de seus respectivos comandos possíveis

#Importando a biblioteca de conexão do mySql
import mysql.connector as mysql
#Importando os códigos de erro da biblioteca para tratamento
from mysql.connector import errorcode

#Legenda:
#   ALL = '*'
#   DISP = 'Dispositivo'
#   OC = 'Ocorrências'
#   TEMP = 'Temperatura'
#   FREQ = 'Frequência de envio do dispositivo'
#   LUM = 'Luminosidade'

#Comandos sql select
SEL_ALL_DISP = "SELECT * FROM tb_dispositivo"
SEL_ALL_OCS = "SELECT * FROM tb_ocorrencia"
SEL_ID_DISP = "SELECT id_dispositivo FROM tb_dispositivo"
SEL_MAX_DISP = "SELECT MAX(id_dispositivo) FROM tb_dispositivo"
SEL_MIN_DISP = "SELECT MIN(id_dispositivo) FROM tb_dispositivo"
SEL_MAX_OC = "SELECT MAX(id_ocorrencia) FROM tb_ocorrencia"
SEL_TEMP_OC = "SELECT vl_temperatura FROM tb_ocorrencia"
SEL_TEMP_HR_OC = "SELECT vl_temperatura,hr_ocorrencia FROM tb_ocorrencia"
SEL_TEMP_HR_DT_OC = "SELECT vl_temperatura,hr_ocorrencia,dt_ocorrencia FROM tb_ocorrencia"
SEL_LUM_OC = "SELECT st_luminosidade FROM tb_ocorrencia"
SEL_FREQ_DISP = "SELECT vl_frequencia_captura FROM tb_dispositivo"

#Comandos sql insert
INS_OC = """INSERT INTO tb_ocorrencia(id_dispositivo,vl_temperatura,vl_luminosidade,dt_ocorrencia,
                                              hr_ocorrencia,st_luminosidade)
            VALUES({0},{1},{2},CURRENT_DATE,CURRENT_TIME,{3})"""
            
#Comandos específicos
SEL_DISP_ULT_TEMP = """SELECT D.*,O.st_luminosidade
                       FROM tb_dispositivo D
                       INNER JOIN tb_ocorrencia O ON D.id_dispositivo = O.id_dispositivo
                       WHERE O.id_ocorrencia = (SELECT MAX(id_ocorrencia)
                                                FROM tb_ocorrencia
                                                WHERE id_dispositivo = D.id_dispositivo)"""

#Cláusulas
WH = "\nWHERE "
DISP = "id_dispositivo = {}"
OC = "id_ocorrencia = {}"
NO_DISP = "no_dispositivo = {}"
ST_DISP = "st_ativo = {}"
ULT_24_HORAS = """ TIMESTAMP(dt_ocorrencia,hr_ocorrencia) BETWEEN 
                   TIMESTAMP(CURRENT_DATE - 1,CURRENT_TIME) AND 
                   TIMESTAMP(CURRENT_DATE,CURRENT_TIME)"""
WH_ULT_24_HORAS = WH + ULT_24_HORAS
WH_DISP = WH + DISP
WH_OC = WH + OC
WH_NO_DISP = WH+NO_DISP
WH_ST_DISP = WH+ST_DISP
MAX_OC_DISP = "id_ocorrencia = ("+SEL_MAX_OC+"\n"+WH_DISP+")"
WH_MAX_OC_DISP = WH + "id_ocorrencia = ("+SEL_MAX_OC+"\n"+WH_DISP+")"
OD_BY_OC = "\nORDER BY id_ocorrencia"

#Operadores
E = " AND"
OU = " OR" 

#Esta função inicializa a conexão com o banco de dados
#   Parâmetros: conn, hst, usr, passwrd.
#   Retorno: Retorna a conexão, se bem sucedida. 'None' se houve falha na conexão.
def dbConnect(hst,usr,passwrd,db):
    try:
        conn = mysql.connect(database=db, user=usr, password=passwrd, host=hst)
        return conn
    except mysql.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #Caso o usuário esteja incorreto, este erro será mostrado
            print('Acesso ao banco de dados negado! Usuário ou senha inválidos!')
            return None
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #Caso a senha esteja incorreta, este erro será mostrado
            print('O banco de dados especificado não existe!')
            return None
        elif err.errno == errorcode.CR_CONN_HOST_ERROR:
            #Caso não seja possível realizar conexão com o banco de dados
            print('\nServidor do banco de dados indisponível. Favor entrar em contato com o administrador do sistema.')
            return None
        else:
            #Caso qualquer outro erro de conexão com o banco ocorra, mostrar mensagem de erro padrão
            print(err)
            return None

            
#Esta função insere dados no banco de dados com base em comando sql
#   Parâmetros: cursor, sqlCmd.
#   Retorno: Retorna 'True' se a inserção for bem sucedida. 'False' se houve falha na inserção.
def dbInsertFromQuery (cursor,query,clausula):
    try:
        cursor.execute(query+clausula+';')
        return True
    except mysql.Error as err:
        if err.errno == errorcode.ER_DUP_ENTRY:
            #Caso tente inserir algum dado duplicado em uma coluna UNIQUE do banco 
            print('\nId duplicado')
            return False
        elif err.errno == errorcode.ER_BAD_FIELD_ERROR:
            #Caso tente inserir algum dado nulo em uma coluna NOT NULL do banco
            print('\nInforme o id')
            return False
        else:
            print(err)
            return False

            
#Esta função insere dados no banco de dados com base em objeto
#   Parâmetros: cursor, obj.
#   Retorno: Retorna 'True' se a inserção for bem sucedida. 'False' se houve falha na inserção.
def dbInsertFromObj (cursor,obj,clausula):
    try:
        sqlCmd = 'INSERT INTO '+obj.getTbName()+'('+obj.getTbCols()+') VALUES ('+obj.getColsValues()+') '+clausula+';' 
        #print(sqlCmd)
        cursor.execute(sqlCmd)
        return True
    except mysql.Error as err:
        if err.errno == errorcode.ER_DUP_ENTRY:
            #Caso tente inserir algum dado duplicado em uma coluna UNIQUE do banco 
            print('\nId duplicado')
            return False
        elif err.errno == errorcode.ER_BAD_FIELD_ERROR:
            #Caso tente inserir algum dado nulo em uma coluna NOT NULL do banco
            print(err)
            return False
        else:
            print(err)
            return False
            
            
#Esta função faz o select no banco de dados com base em comando sql
#   Parâmetros: cursor, query
#   Retorno: retorna uma 'list' com resultado da query. Retorna 'None' caso haja alguma falha.
def dbExecQuery (cursor,query):
    try:
        cursor.execute(query)
        return True
    except mysql.Error as err:
        print(err)
        return False
        

#Esta função faz o select no banco de dados com base em comando sql
#   Parâmetros: cursor, query, filtro
#   Retorno: retorna uma 'list' com resultado da query. Retorna 'None' caso haja alguma falha.
def dbSelectFromQuery (cursor,query,clausula = ''):
    try:
        print(query+' '+clausula+';')
        cursor.execute(query+clausula)
        return cursor.fetchall()
    except mysql.Error as err:
        print(err)
        return None
        
        
#Esta função faz o select no banco de dados com base em comando sql
#   Parâmetros: cursor, query, filtro
#   Retorno: retorna uma 'list' com resultado da query. Retorna 'None' caso haja alguma falha.
def dbSelectFromQueryUnion (cursor,queryAndClausulas):
    try:
        query = ''
        i = 0
        if(len(queryAndClausulas) > 1):
            for row in queryAndClausulas:
                for col in row:
                    query = query + col + '\n'  
                if (i < len(queryAndClausulas) - 1):
                    query = query + '\n' + 'UNION ALL' + '\n'
                i += 1
        else:
            print('É necessário uma lista com mais de um registro para construir a query!')
        print(query)
        cursor.execute(query)
        return cursor.fetchall()
    except mysql.Error as err:
        print(err)
        return None
        

#Esta função faz o select no banco de dados com base em um objeto
#   Parâmetros: cursor, obj, filtro
#   Retorno: retorna uma 'list' com resultado da query. Retorna 'None' caso haja alguma falha.
def dbSelectFromObj (cursor,obj,clausula = ''):
    try:
        sqlCmd = 'SELECT '+obj.getTbCols()+' from '+obj.getTbName()+' '+clausula+';'
        print(sqlCmd)
        cursor.execute(sqlCmd)
        return cursor.fetchall()
    except mysql.Error as err:
        print(err)
        return None