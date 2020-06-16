#Esta é uma biblioteca básica que trata das conexões com o banco de dados MySql
#e de seus respectivos comandos possíveis

#Importando a biblioteca de conexão do mySql
import mysql.connector as mysql
#Importando os códigos de erro da biblioteca para tratamento
from mysql.connector import errorcode

#Esta função inicializa a conexão com o banco de dados
#   Parâmetros: conn, hst, usr, passwrd.
#   Retorno: Retorna a conexão, se bem sucedida. 'None' se houve falha na conexão.
def dbStart(hst,usr,passwrd,db):
    try:
        conn = mysql.connect(database=db, user=usr, password=passwrd, host=hst)
        return conn
    except mysql.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            #Caso o usuário esteja incorreto, este erro será mostrado
            raise Exception('Acesso ao banco de dados negado! Usuário ou senha inválidos!')
            return None
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            #Caso a senha esteja incorreta, este erro será mostrado
            raise Exception('O banco de dados especificado não existe!')
            return None
        elif err.errno == errorcode.CR_CONN_HOST_ERROR:
            #Caso não seja possível realizar conexão com o banco de dados
            raise Exception('\nServidor do banco de dados indisponível. Favor entrar em contato com o administrador do sistema.')
            return None
        else:
            #Caso qualquer outro erro de conexão com o banco ocorra, mostrar mensagem de erro padrão
            raise Exception(err)
            return None

            
#Esta função insere dados no banco de dados
#   Parâmetros: cursor, sqlCmd.
#   Retorno: Retorna 'True' se a inserção for bem sucedida. 'False' se houve falha na inserção.
def dbInsert (cursor,sqlCmd):
    try:
        cursor.execute(sqlCmd)
        return True
    except mysql.Error as err:
        if err.errno == errorcode.ER_DUP_ENTRY:
            #Caso tente inserir algum dado duplicado em uma coluna UNIQUE do banco 
            raise Exception('\nId duplicado')
            return False
        elif err.errno == errorcode.ER_BAD_FIELD_ERROR:
            #Caso tente inserir algum dado nulo em uma coluna NOT NULL do banco
            raise Exception('\nInforme o id')
            return False
        else:
            raise Exception(err)
            return False
            
            
#Esta função faz o select no banco de dados
#   Parâmetros: cursor, query
#   Retorno: returna uma 'list' com resultado da query. Retorne 'None' caso haja alguma falha.
def dbSelect (cursor,query):
    try:
        cursor.execute(query)
        return cursor.fetchall()
    except mysql.Error as err:
        raise Exception(err)
        return None



