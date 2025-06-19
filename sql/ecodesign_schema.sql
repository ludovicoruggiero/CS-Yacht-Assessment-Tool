-- SQL schema for EcoDesign Guidelines
-- This script creates all tables and types required for managing guidelines

-- 1. Enable schema and extension
create schema if not exists lcd_guidelines;
set search_path to lcd_guidelines, public;
create extension if not exists "pgcrypto";

-- 2. ENUMS
create type priority_enum as enum ('Low', 'Medium', 'High');
create type life_cycle_phase_enum as enum (
  'Upstream', 'Design', 'Production', 'Operation', 'Downstream', 'End-of-Life'
);

-- 3. LOOKUP TABLES
create table target_groups (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table implementation_groups (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table hull_types (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table propulsion_types (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table yacht_size_classes (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table operational_profiles (id uuid primary key default gen_random_uuid(), code text unique, label text);
create table technology_readiness_levels (id uuid primary key default gen_random_uuid(), code text unique, label text);

-- 4. STRATEGY STRUCTURE
create table strategies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table substrategies (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies(id) on delete cascade,
  name text not null,
  unique (strategy_id, name)
);

-- 5. GUIDELINES
create table guidelines (
  id uuid primary key default gen_random_uuid(),
  substrategy_id uuid not null references substrategies(id) on delete cascade,
  title text not null,
  description text,
  priority priority_enum not null,
  implementation_group_id uuid not null references implementation_groups(id),
  created_at timestamptz not null default now()
);

-- 6. SOURCES (Reusable)
create table sources (id uuid primary key default gen_random_uuid(), name text unique);
create table guideline_sources (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key (guideline_id, source_id)
);

-- 7. MANY-TO-MANY TAG RELATIONS
create table guideline_dependencies (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  dependent_group_id uuid not null references implementation_groups(id),
  primary key (guideline_id, dependent_group_id)
);
create table guideline_target_groups (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  target_group_id uuid not null references target_groups(id),
  primary key (guideline_id, target_group_id)
);
create table guideline_life_cycle_phases (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  phase life_cycle_phase_enum not null,
  primary key (guideline_id, phase)
);
create table guideline_hull_types (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  hull_type_id uuid not null references hull_types(id),
  primary key (guideline_id, hull_type_id)
);
create table guideline_propulsion_types (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  propulsion_type_id uuid not null references propulsion_types(id),
  primary key (guideline_id, propulsion_type_id)
);
create table guideline_yacht_size_classes (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  size_class_id uuid not null references yacht_size_classes(id),
  primary key (guideline_id, size_class_id)
);
create table guideline_operational_profiles (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  profile_id uuid not null references operational_profiles(id),
  primary key (guideline_id, profile_id)
);
create table guideline_trls (
  guideline_id uuid not null references guidelines(id) on delete cascade,
  trl_id uuid not null references technology_readiness_levels(id),
  primary key (guideline_id, trl_id)
);
