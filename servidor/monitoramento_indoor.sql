-- MySQL Script generated by MySQL Workbench
-- Wed Jun 24 13:54:39 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Database `db_indoor`
-- -----------------------------------------------------
DROP DATABASE IF EXISTS `db_indoor`;
CREATE DATABASE `db_indoor`;


-- -----------------------------------------------------
-- Table `tb_dispositivo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_dispositivo` (
  `id_dispositivo` INT UNSIGNED NOT NULL COMMENT 'identificador dispositivo',
  `no_dispositivo` VARCHAR(15) NOT NULL COMMENT '\'Descrição dispositivo\'',
  `no_localizacao` VARCHAR(45) NOT NULL COMMENT '\'Localização do dispositivo\'',
  `vl_min_luminosidade` INT(3) NOT NULL COMMENT 'Valor mínimo Luminnosidade dispositivo',
  `vl_frequencia_captura` INT(3) NOT NULL COMMENT 'Frequência de captura do dispositivo',
  `st_ativo` CHAR(1) NOT NULL DEFAULT 'A' COMMENT 'Status ativo ou inativo do dispositivo',
  PRIMARY KEY (`id_dispositivo`),
  UNIQUE INDEX `id_dispositivo_UNIQUE` (`id_dispositivo` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tb_ocorrencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_ocorrencia` (
  `id_ocorrencia` INT UNSIGNED NOT NULL COMMENT 'Identificador da ocorrência captura',
  `id_dispositivo` INT UNSIGNED NOT NULL COMMENT 'Identificador dispositivo',
  `vl_temperatura` DECIMAL(3,1) NOT NULL COMMENT 'Valor da temperatura capturada',
  `vl_luminosidade` INT(3) NOT NULL COMMENT 'Valor da luminosiade capturada',
  `dt_ocorrencia` DATE NOT NULL COMMENT 'Data que houve a captura dos dados',
  `hr_ocorrencia` TIME NOT NULL COMMENT 'Hora da captura dos dados',
  `st_luminosidade` CHAR(1) NOT NULL COMMENT '\'Indica se o dispositivo está ligado ou desligado\'',
  PRIMARY KEY (`id_ocorrencia`, `vl_luminosidade`),
  UNIQUE INDEX `idtb_luminosidade_UNIQUE` (`id_ocorrencia` ASC),
  INDEX `fk_tb_ocorrencia_tb_dispositivo_idx` (`id_dispositivo` ASC),
  CONSTRAINT `fk_tb_ocorrencia_tb_dispositivo`
    FOREIGN KEY (`id_dispositivo`)
    REFERENCES `tb_dispositivo` (`id_dispositivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `tb_parametro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_parametro` (
  `vl_intervalo_min` INT(3) NOT NULL)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;