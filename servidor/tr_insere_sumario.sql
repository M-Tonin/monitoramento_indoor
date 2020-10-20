-- Esta TRIGGER insere as diferenças de tempo das luminosidades,
-- na tabela 'tb_sumario' para cada inserção na tabela 'tb_estado_dispositivo'.

USE `db_indoor`;

DROP TRIGGER IF EXISTS `trig_calcula_luminosidade`;

DELIMITER //

CREATE OR REPLACE TRIGGER `tr_insere_sumario` BEFORE INSERT ON `tb_estado_dispositivo` FOR EACH ROW 
BEGIN
    IF NEW.st_estado = '0' THEN
        IF EXISTS (SELECT * FROM tb_estado_dispositivo
				   WHERE id_dispositivo = NEW.id_dispositivo
				   AND TIMESTAMP(dt_ocorrencia,hr_ocorrencia) <
					   TIMESTAMP(NEW.dt_ocorrencia,NEW.hr_ocorrencia)
				   AND st_estado = '1') THEN

            SELECT hr_ocorrencia
            INTO @hr_ult_ocorrencia
            FROM tb_estado_dispositivo
            WHERE id_dispositivo = NEW.id_dispositivo
            AND TIMESTAMP(dt_ocorrencia,hr_ocorrencia) <
			    TIMESTAMP(NEW.dt_ocorrencia,NEW.hr_ocorrencia)
			AND st_estado = '1'
            ORDER BY id_estado_dispositivo DESC, TIMESTAMP(dt_ocorrencia,hr_ocorrencia) DESC
            LIMIT 1;

			INSERT INTO tb_sumario(id_dispositivo,dt_ocorrencia,hr_ocorrencia,hr_diferenca_luminosidade)
			VALUES (NEW.id_dispositivo,NEW.dt_ocorrencia,NEW.hr_ocorrencia,TIMEDIFF(NEW.hr_ocorrencia,@hr_ult_ocorrencia));

        END IF;
    END IF;
END;//

DELIMITER ;