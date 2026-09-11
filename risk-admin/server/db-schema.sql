-- ============================================================
-- 风险评分系统 - 数据库建表脚本 (MySQL 8.0)
-- 对应方案文档 3.2 节 8 张表
-- 说明：后端 synchronize:true 时可自动建表；本文件用于手动初始化或生产环境（建议关闭 synchronize 改用迁移）
-- ============================================================

CREATE DATABASE IF NOT EXISTS `risk_admin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `risk_admin`;

-- ① 后台管理员表
CREATE TABLE IF NOT EXISTS `admin_user` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username`      VARCHAR(64)     NOT NULL COMMENT '登录账号',
  `password`      VARCHAR(128)    NOT NULL COMMENT '密码（bcrypt 加密）',
  `real_name`     VARCHAR(64)     DEFAULT NULL COMMENT '真实姓名',
  `phone`         VARCHAR(20)     DEFAULT NULL COMMENT '手机号',
  `email`         VARCHAR(128)    DEFAULT NULL COMMENT '邮箱',
  `role`          VARCHAR(32)     NOT NULL DEFAULT 'operator' COMMENT '角色: super_admin/operator/viewer',
  `status`        TINYINT         NOT NULL DEFAULT 1 COMMENT '状态: 1启用 0禁用',
  `last_login_at` DATETIME        DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(64)     DEFAULT NULL COMMENT '最后登录IP',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at`    DATETIME        DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台管理员表';

-- ② 客户主表（被评估对象）
CREATE TABLE IF NOT EXISTS `customer` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `customer_no`   VARCHAR(32)     NOT NULL COMMENT '客户编号（业务唯一）',
  `name`          VARCHAR(64)     NOT NULL COMMENT '姓名',
  `id_card`       VARCHAR(32)     NOT NULL COMMENT '身份证号（加密存储 AES）',
  `id_card_hash`  CHAR(64)        NOT NULL COMMENT '身份证号SHA256哈希（用于去重/查询）',
  `phone`         VARCHAR(20)     NOT NULL COMMENT '手机号',
  `gender`        TINYINT         DEFAULT NULL COMMENT '性别: 1男 2女 0未知',
  `birthday`      DATE            DEFAULT NULL COMMENT '出生日期',
  `status`        TINYINT         NOT NULL DEFAULT 1 COMMENT '状态: 1正常 0禁用',
  `source`        VARCHAR(32)     NOT NULL DEFAULT 'h5' COMMENT '来源: h5/admin/import',
  `remark`        VARCHAR(255)    DEFAULT NULL COMMENT '备注',
  `created_by`    BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人（管理员ID）',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at`    DATETIME        DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_no` (`customer_no`),
  UNIQUE KEY `uk_id_card_hash` (`id_card_hash`),
  KEY `idx_name` (`name`),
  KEY `idx_phone` (`phone`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户主表';

-- ③ 客户资料表（H5 填写信息落地）
CREATE TABLE IF NOT EXISTS `customer_profile` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `customer_id`   BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `name`          VARCHAR(64)     NOT NULL COMMENT '姓名',
  `id_card`       VARCHAR(32)     NOT NULL COMMENT '身份证号（加密存储）',
  `phone`         VARCHAR(20)     NOT NULL COMMENT '手机号',
  `ext_info`      JSON            DEFAULT NULL COMMENT '扩展信息（JSON，预留字段）',
  `submit_source` VARCHAR(32)     NOT NULL DEFAULT 'h5' COMMENT '提交来源',
  `submit_ip`     VARCHAR(64)     DEFAULT NULL COMMENT '提交IP',
  `user_agent`    VARCHAR(512)    DEFAULT NULL COMMENT 'UA',
  `version`       INT             NOT NULL DEFAULT 1 COMMENT '资料版本号（每次修改+1）',
  `is_current`    TINYINT         NOT NULL DEFAULT 1 COMMENT '是否当前有效版本: 1是 0否',
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_current` (`is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户资料表（H5填写信息）';

-- ④ 风险评估记录表
CREATE TABLE IF NOT EXISTS `risk_assessment` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `assessment_no`  VARCHAR(32)     NOT NULL COMMENT '评估单号',
  `customer_id`    BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
  `profile_id`     BIGINT UNSIGNED NOT NULL COMMENT '关联资料ID',
  `comprehensive_score` SMALLINT   DEFAULT NULL COMMENT '综合评分 0-1000',
  `risk_level`     TINYINT         DEFAULT NULL COMMENT '风险等级: 1低 2中 3高',
  `status`         TINYINT         NOT NULL DEFAULT 0 COMMENT '状态: 0待处理 1计算中 2完成 3失败',
  `calc_source`    VARCHAR(32)     NOT NULL DEFAULT 'auto' COMMENT '计算来源: auto/manual',
  `fail_reason`    VARCHAR(255)    DEFAULT NULL COMMENT '失败原因',
  `assessed_at`    DATETIME        DEFAULT NULL COMMENT '评估完成时间',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assessment_no` (`assessment_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='风险评估记录表';

-- ⑤ 评分明细表（综合 + 单银行）
CREATE TABLE IF NOT EXISTS `score_detail` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `assessment_id`  BIGINT UNSIGNED NOT NULL COMMENT '评估记录ID',
  `score_type`     VARCHAR(16)     NOT NULL COMMENT '评分类型: comprehensive/boc/icbc/abc/ccb',
  `score`          SMALLINT        NOT NULL COMMENT '分数 0-1000',
  `risk_level`     TINYINT         NOT NULL COMMENT '风险等级: 1低 2中 3高',
  `trend`          VARCHAR(8)      DEFAULT NULL COMMENT '趋势: up/down/stable',
  `dimensions`     JSON            DEFAULT NULL COMMENT '评分维度明细（JSON）',
  `is_manual`      TINYINT         NOT NULL DEFAULT 0 COMMENT '是否人工修正: 1是 0否',
  `manual_reason`  VARCHAR(255)    DEFAULT NULL COMMENT '修正原因',
  `operator_id`    BIGINT UNSIGNED DEFAULT NULL COMMENT '修正操作人',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assessment_type` (`assessment_id`, `score_type`),
  KEY `idx_score_type` (`score_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分明细表';

-- ⑥ 同步日志表
CREATE TABLE IF NOT EXISTS `sync_record` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `biz_type`    VARCHAR(32)     NOT NULL COMMENT '业务类型: profile/assessment',
  `biz_id`      BIGINT UNSIGNED NOT NULL COMMENT '业务ID',
  `action`      VARCHAR(16)     NOT NULL COMMENT '动作: create/update/delete',
  `payload`     JSON            DEFAULT NULL COMMENT '同步内容快照',
  `sync_status` TINYINT         NOT NULL DEFAULT 0 COMMENT '同步状态: 0待推送 1已推送 2失败',
  `retry_count` INT             NOT NULL DEFAULT 0 COMMENT '重试次数',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `pushed_at`   DATETIME        DEFAULT NULL COMMENT '推送成功时间',
  PRIMARY KEY (`id`),
  KEY `idx_sync_status` (`sync_status`),
  KEY `idx_biz` (`biz_type`, `biz_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据同步日志表';

-- ⑦ 操作日志表
CREATE TABLE IF NOT EXISTS `operation_log` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `operator_id` BIGINT UNSIGNED NOT NULL COMMENT '操作人ID',
  `operator`    VARCHAR(64)     DEFAULT NULL COMMENT '操作人账号',
  `module`      VARCHAR(64)     NOT NULL COMMENT '模块',
  `action`      VARCHAR(64)     NOT NULL COMMENT '动作',
  `target_type` VARCHAR(32)     DEFAULT NULL COMMENT '目标类型',
  `target_id`   BIGINT UNSIGNED DEFAULT NULL COMMENT '目标ID',
  `before_data` JSON            DEFAULT NULL COMMENT '变更前数据',
  `after_data`  JSON            DEFAULT NULL COMMENT '变更后数据',
  `ip`          VARCHAR(64)     DEFAULT NULL COMMENT '操作IP',
  `created_at`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_operator` (`operator_id`),
  KEY `idx_module` (`module`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ⑧ 数据字典表（可选）
CREATE TABLE IF NOT EXISTS `sys_dict` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_type`  VARCHAR(64)     NOT NULL COMMENT '字典类型',
  `dict_key`   VARCHAR(64)     NOT NULL COMMENT '字典键',
  `dict_value` VARCHAR(255)    NOT NULL COMMENT '字典值',
  `sort`       INT             NOT NULL DEFAULT 0 COMMENT '排序',
  `status`     TINYINT         NOT NULL DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_type_key` (`dict_type`, `dict_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据字典表';

-- ============================================================
-- 初始化数据：默认管理员账号（密码明文 123456，仅骨架占位）
-- 生产环境请改为 bcrypt 哈希并移出 SQL
-- ============================================================
INSERT INTO `admin_user` (`username`, `password`, `real_name`, `role`, `status`)
SELECT 'admin', '123456', '超级管理员', 'super_admin', 1
WHERE NOT EXISTS (SELECT 1 FROM `admin_user` WHERE `username` = 'admin');
