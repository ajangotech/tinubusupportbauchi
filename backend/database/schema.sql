-- =============================================================
-- Tinubu Support Bauchi 2027 — MySQL Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS tinubu_support_bauchi_2027
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tinubu_support_bauchi_2027;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  phone           VARCHAR(30) NULL,
  password        VARCHAR(255) NOT NULL,
  role            ENUM('super_admin','admin','membership_officer','corporate_officer','editor','member','corporate_user') NOT NULL DEFAULT 'member',
  status          ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  reset_token     VARCHAR(255) NULL,
  reset_expires_at DATETIME NULL,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------- members ----------
CREATE TABLE IF NOT EXISTS members (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            BIGINT UNSIGNED NULL,
  membership_number  VARCHAR(40) NOT NULL,
  first_name         VARCHAR(80) NOT NULL,
  middle_name        VARCHAR(80) NULL,
  last_name          VARCHAR(80) NOT NULL,
  gender             ENUM('male','female','other') NULL,
  date_of_birth      DATE NULL,
  phone              VARCHAR(30) NULL,
  email              VARCHAR(190) NULL,
  nin                VARCHAR(20) NULL,
  occupation         VARCHAR(150) NULL,
  state              VARCHAR(80) NULL,
  lga                VARCHAR(80) NULL,
  ward               VARCHAR(80) NULL,
  polling_unit       VARCHAR(120) NULL,
  address            VARCHAR(255) NULL,
  passport_photo     VARCHAR(255) NULL,
  status             ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  registration_date  DATE NOT NULL,
  approved_at        DATETIME NULL,
  approved_by        BIGINT UNSIGNED NULL,
  rejection_reason   VARCHAR(255) NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_members_membership_number (membership_number),
  KEY idx_members_user_id (user_id),
  KEY idx_members_status (status),
  CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- corporate_organizations ----------
CREATE TABLE IF NOT EXISTS corporate_organizations (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NULL,
  corporate_number    VARCHAR(40) NOT NULL,
  organization_name   VARCHAR(190) NOT NULL,
  organization_type   VARCHAR(120) NULL,
  registration_number VARCHAR(80) NULL,
  contact_person      VARCHAR(150) NULL,
  phone               VARCHAR(30) NULL,
  email               VARCHAR(190) NULL,
  state               VARCHAR(80) NULL,
  lga                 VARCHAR(80) NULL,
  office_address      VARCHAR(255) NULL,
  website             VARCHAR(190) NULL,
  organization_logo   VARCHAR(255) NULL,
  support_area        VARCHAR(255) NULL,
  supporting_documents JSON NULL,
  status              ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  approved_at         DATETIME NULL,
  approved_by         BIGINT UNSIGNED NULL,
  rejection_reason    VARCHAR(255) NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_corporate_number (corporate_number),
  KEY idx_corporate_user_id (user_id),
  KEY idx_corporate_status (status),
  CONSTRAINT fk_corporate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- blog_categories ----------
CREATE TABLE IF NOT EXISTS blog_categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(160) NOT NULL,
  description TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_categories_slug (slug)
) ENGINE=InnoDB;

-- ---------- blog_posts ----------
CREATE TABLE IF NOT EXISTS blog_posts (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id      BIGINT UNSIGNED NULL,
  author_id        BIGINT UNSIGNED NULL,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL,
  excerpt          VARCHAR(500) NULL,
  content          LONGTEXT NULL,
  featured_image   VARCHAR(255) NULL,
  tags             JSON NULL,
  meta_title       VARCHAR(255) NULL,
  meta_description VARCHAR(500) NULL,
  status           ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at     DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_posts_slug (slug),
  KEY idx_blog_status (status),
  KEY idx_blog_category (category_id),
  CONSTRAINT fk_blog_category FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- events ----------
CREATE TABLE IF NOT EXISTS events (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL,
  description     LONGTEXT NULL,
  event_date      DATE NOT NULL,
  event_time      TIME NULL,
  location        VARCHAR(255) NULL,
  featured_image VARCHAR(255) NULL,
  status          ENUM('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_events_slug (slug),
  KEY idx_events_date (event_date),
  KEY idx_events_status (status)
) ENGINE=InnoDB;

-- ---------- leadership ----------
CREATE TABLE IF NOT EXISTS leadership (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(150) NOT NULL,
  position     VARCHAR(150) NOT NULL,
  biography    TEXT NULL,
  photo        VARCHAR(255) NULL,
  social_links JSON NULL,
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------- contact_messages ----------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(190) NOT NULL,
  phone      VARCHAR(30) NULL,
  subject    VARCHAR(255) NULL,
  message    TEXT NOT NULL,
  status     ENUM('new','read','replied','archived') NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_status (status)
) ENGINE=InnoDB;

-- ---------- newsletter_subscribers ----------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email      VARCHAR(190) NOT NULL,
  status     ENUM('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  token      VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_email (email),
  KEY idx_newsletter_token (token)
) ENGINE=InnoDB;

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50) NOT NULL DEFAULT 'info',
  read_at    DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------- activity_logs ----------
CREATE TABLE IF NOT EXISTS activity_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(120) NOT NULL,
  description TEXT NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logs_user (user_id),
  KEY idx_logs_action (action)
) ENGINE=InnoDB;
