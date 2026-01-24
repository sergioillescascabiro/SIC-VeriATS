create type "public"."applicationstatus" as enum ('PENDING', 'VERIFIED', 'INTERVIEW', 'REJECTED', 'HIRED');

create type "public"."jobstatus" as enum ('DRAFT', 'ACTIVE', 'CLOSED');

create type "public"."proficiencylevel" as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

create type "public"."userrole" as enum ('ADMIN', 'COMPANY', 'CANDIDATE');

create type "public"."validationstatus" as enum ('PENDING', 'VERIFIED', 'REJECTED');

create sequence "public"."application_status_history_id_seq";

create sequence "public"."applications_id_seq";

create sequence "public"."cvs_id_seq";

create sequence "public"."jobs_id_seq";

create sequence "public"."public_profiles_id_seq";

create sequence "public"."requirements_id_seq";

create sequence "public"."sensitive_data_id_seq";

create sequence "public"."users_id_seq";

create sequence "public"."validations_id_seq";


  create table "public"."application_status_history" (
    "id" integer not null default nextval('public.application_status_history_id_seq'::regclass),
    "application_id" integer not null,
    "changed_by" integer not null,
    "old_status" public.applicationstatus,
    "new_status" public.applicationstatus not null,
    "notes" text,
    "changed_at" timestamp with time zone default now()
      );



  create table "public"."applications" (
    "id" integer not null default nextval('public.applications_id_seq'::regclass),
    "candidate_id" integer not null,
    "job_id" integer not null,
    "status" public.applicationstatus not null,
    "cover_letter" text,
    "score" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."cvs" (
    "id" integer not null default nextval('public.cvs_id_seq'::regclass),
    "user_id" integer not null,
    "filename" character varying not null,
    "storage_path" character varying not null,
    "content_type" character varying not null,
    "size" integer not null,
    "is_primary" boolean,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."jobs" (
    "id" integer not null default nextval('public.jobs_id_seq'::regclass),
    "company_id" integer not null,
    "title" character varying not null,
    "description" text not null,
    "status" public.jobstatus not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
      );



  create table "public"."public_profiles" (
    "id" integer not null default nextval('public.public_profiles_id_seq'::regclass),
    "user_id" integer not null,
    "blind_code" character varying not null,
    "years_of_experience" integer,
    "bio" text,
    "skills" text,
    "score" integer not null
      );



  create table "public"."requirements" (
    "id" integer not null default nextval('public.requirements_id_seq'::regclass),
    "job_id" integer not null,
    "skill_name" character varying not null,
    "proficiency_level" public.proficiencylevel not null,
    "description" text,
    "is_required" integer not null
      );



  create table "public"."sensitive_data" (
    "id" integer not null default nextval('public.sensitive_data_id_seq'::regclass),
    "user_id" integer not null,
    "full_name" character varying not null,
    "gender" character varying,
    "university" character varying,
    "phone" character varying,
    "address" text
      );



  create table "public"."users" (
    "id" integer not null default nextval('public.users_id_seq'::regclass),
    "email" character varying not null,
    "hashed_password" character varying not null,
    "role" public.userrole not null,
    "company_name" character varying,
    "company_description" character varying,
    "company_logo_url" character varying,
    "company_status" character varying,
    "company_industry" character varying,
    "company_website" character varying,
    "is_active" integer not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone,
    "is_sponsor" integer default 0
      );



  create table "public"."validations" (
    "id" integer not null default nextval('public.validations_id_seq'::regclass),
    "application_id" integer not null,
    "requirement_id" integer not null,
    "status" public.validationstatus not null,
    "notes" text,
    "validated_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
      );


alter sequence "public"."application_status_history_id_seq" owned by "public"."application_status_history"."id";

alter sequence "public"."applications_id_seq" owned by "public"."applications"."id";

alter sequence "public"."cvs_id_seq" owned by "public"."cvs"."id";

alter sequence "public"."jobs_id_seq" owned by "public"."jobs"."id";

alter sequence "public"."public_profiles_id_seq" owned by "public"."public_profiles"."id";

alter sequence "public"."requirements_id_seq" owned by "public"."requirements"."id";

alter sequence "public"."sensitive_data_id_seq" owned by "public"."sensitive_data"."id";

alter sequence "public"."users_id_seq" owned by "public"."users"."id";

alter sequence "public"."validations_id_seq" owned by "public"."validations"."id";

CREATE UNIQUE INDEX application_status_history_pkey ON public.application_status_history USING btree (id);

CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (id);

CREATE UNIQUE INDEX cvs_pkey ON public.cvs USING btree (id);

CREATE INDEX ix_application_status_history_id ON public.application_status_history USING btree (id);

CREATE INDEX ix_applications_id ON public.applications USING btree (id);

CREATE INDEX ix_cvs_id ON public.cvs USING btree (id);

CREATE INDEX ix_jobs_id ON public.jobs USING btree (id);

CREATE UNIQUE INDEX ix_public_profiles_blind_code ON public.public_profiles USING btree (blind_code);

CREATE INDEX ix_public_profiles_id ON public.public_profiles USING btree (id);

CREATE INDEX ix_requirements_id ON public.requirements USING btree (id);

CREATE INDEX ix_sensitive_data_id ON public.sensitive_data USING btree (id);

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

CREATE INDEX ix_users_id ON public.users USING btree (id);

CREATE INDEX ix_validations_id ON public.validations USING btree (id);

CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);

CREATE UNIQUE INDEX public_profiles_pkey ON public.public_profiles USING btree (id);

CREATE UNIQUE INDEX public_profiles_user_id_key ON public.public_profiles USING btree (user_id);

CREATE UNIQUE INDEX requirements_pkey ON public.requirements USING btree (id);

CREATE UNIQUE INDEX sensitive_data_pkey ON public.sensitive_data USING btree (id);

CREATE UNIQUE INDEX sensitive_data_user_id_key ON public.sensitive_data USING btree (user_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX validations_pkey ON public.validations USING btree (id);

alter table "public"."application_status_history" add constraint "application_status_history_pkey" PRIMARY KEY using index "application_status_history_pkey";

alter table "public"."applications" add constraint "applications_pkey" PRIMARY KEY using index "applications_pkey";

alter table "public"."cvs" add constraint "cvs_pkey" PRIMARY KEY using index "cvs_pkey";

alter table "public"."jobs" add constraint "jobs_pkey" PRIMARY KEY using index "jobs_pkey";

alter table "public"."public_profiles" add constraint "public_profiles_pkey" PRIMARY KEY using index "public_profiles_pkey";

alter table "public"."requirements" add constraint "requirements_pkey" PRIMARY KEY using index "requirements_pkey";

alter table "public"."sensitive_data" add constraint "sensitive_data_pkey" PRIMARY KEY using index "sensitive_data_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."validations" add constraint "validations_pkey" PRIMARY KEY using index "validations_pkey";

alter table "public"."application_status_history" add constraint "application_status_history_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) not valid;

alter table "public"."application_status_history" validate constraint "application_status_history_application_id_fkey";

alter table "public"."application_status_history" add constraint "application_status_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public.users(id) not valid;

alter table "public"."application_status_history" validate constraint "application_status_history_changed_by_fkey";

alter table "public"."applications" add constraint "applications_candidate_id_fkey" FOREIGN KEY (candidate_id) REFERENCES public.users(id) not valid;

alter table "public"."applications" validate constraint "applications_candidate_id_fkey";

alter table "public"."applications" add constraint "applications_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."applications" validate constraint "applications_job_id_fkey";

alter table "public"."cvs" add constraint "cvs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."cvs" validate constraint "cvs_user_id_fkey";

alter table "public"."jobs" add constraint "jobs_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.users(id) not valid;

alter table "public"."jobs" validate constraint "jobs_company_id_fkey";

alter table "public"."public_profiles" add constraint "public_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."public_profiles" validate constraint "public_profiles_user_id_fkey";

alter table "public"."public_profiles" add constraint "public_profiles_user_id_key" UNIQUE using index "public_profiles_user_id_key";

alter table "public"."requirements" add constraint "requirements_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."requirements" validate constraint "requirements_job_id_fkey";

alter table "public"."sensitive_data" add constraint "sensitive_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."sensitive_data" validate constraint "sensitive_data_user_id_fkey";

alter table "public"."sensitive_data" add constraint "sensitive_data_user_id_key" UNIQUE using index "sensitive_data_user_id_key";

alter table "public"."validations" add constraint "validations_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) not valid;

alter table "public"."validations" validate constraint "validations_application_id_fkey";

alter table "public"."validations" add constraint "validations_requirement_id_fkey" FOREIGN KEY (requirement_id) REFERENCES public.requirements(id) not valid;

alter table "public"."validations" validate constraint "validations_requirement_id_fkey";

grant delete on table "public"."application_status_history" to "anon";

grant insert on table "public"."application_status_history" to "anon";

grant references on table "public"."application_status_history" to "anon";

grant select on table "public"."application_status_history" to "anon";

grant trigger on table "public"."application_status_history" to "anon";

grant truncate on table "public"."application_status_history" to "anon";

grant update on table "public"."application_status_history" to "anon";

grant delete on table "public"."application_status_history" to "authenticated";

grant insert on table "public"."application_status_history" to "authenticated";

grant references on table "public"."application_status_history" to "authenticated";

grant select on table "public"."application_status_history" to "authenticated";

grant trigger on table "public"."application_status_history" to "authenticated";

grant truncate on table "public"."application_status_history" to "authenticated";

grant update on table "public"."application_status_history" to "authenticated";

grant delete on table "public"."application_status_history" to "service_role";

grant insert on table "public"."application_status_history" to "service_role";

grant references on table "public"."application_status_history" to "service_role";

grant select on table "public"."application_status_history" to "service_role";

grant trigger on table "public"."application_status_history" to "service_role";

grant truncate on table "public"."application_status_history" to "service_role";

grant update on table "public"."application_status_history" to "service_role";

grant delete on table "public"."applications" to "anon";

grant insert on table "public"."applications" to "anon";

grant references on table "public"."applications" to "anon";

grant select on table "public"."applications" to "anon";

grant trigger on table "public"."applications" to "anon";

grant truncate on table "public"."applications" to "anon";

grant update on table "public"."applications" to "anon";

grant delete on table "public"."applications" to "authenticated";

grant insert on table "public"."applications" to "authenticated";

grant references on table "public"."applications" to "authenticated";

grant select on table "public"."applications" to "authenticated";

grant trigger on table "public"."applications" to "authenticated";

grant truncate on table "public"."applications" to "authenticated";

grant update on table "public"."applications" to "authenticated";

grant delete on table "public"."applications" to "service_role";

grant insert on table "public"."applications" to "service_role";

grant references on table "public"."applications" to "service_role";

grant select on table "public"."applications" to "service_role";

grant trigger on table "public"."applications" to "service_role";

grant truncate on table "public"."applications" to "service_role";

grant update on table "public"."applications" to "service_role";

grant delete on table "public"."cvs" to "anon";

grant insert on table "public"."cvs" to "anon";

grant references on table "public"."cvs" to "anon";

grant select on table "public"."cvs" to "anon";

grant trigger on table "public"."cvs" to "anon";

grant truncate on table "public"."cvs" to "anon";

grant update on table "public"."cvs" to "anon";

grant delete on table "public"."cvs" to "authenticated";

grant insert on table "public"."cvs" to "authenticated";

grant references on table "public"."cvs" to "authenticated";

grant select on table "public"."cvs" to "authenticated";

grant trigger on table "public"."cvs" to "authenticated";

grant truncate on table "public"."cvs" to "authenticated";

grant update on table "public"."cvs" to "authenticated";

grant delete on table "public"."cvs" to "service_role";

grant insert on table "public"."cvs" to "service_role";

grant references on table "public"."cvs" to "service_role";

grant select on table "public"."cvs" to "service_role";

grant trigger on table "public"."cvs" to "service_role";

grant truncate on table "public"."cvs" to "service_role";

grant update on table "public"."cvs" to "service_role";

grant delete on table "public"."jobs" to "anon";

grant insert on table "public"."jobs" to "anon";

grant references on table "public"."jobs" to "anon";

grant select on table "public"."jobs" to "anon";

grant trigger on table "public"."jobs" to "anon";

grant truncate on table "public"."jobs" to "anon";

grant update on table "public"."jobs" to "anon";

grant delete on table "public"."jobs" to "authenticated";

grant insert on table "public"."jobs" to "authenticated";

grant references on table "public"."jobs" to "authenticated";

grant select on table "public"."jobs" to "authenticated";

grant trigger on table "public"."jobs" to "authenticated";

grant truncate on table "public"."jobs" to "authenticated";

grant update on table "public"."jobs" to "authenticated";

grant delete on table "public"."jobs" to "service_role";

grant insert on table "public"."jobs" to "service_role";

grant references on table "public"."jobs" to "service_role";

grant select on table "public"."jobs" to "service_role";

grant trigger on table "public"."jobs" to "service_role";

grant truncate on table "public"."jobs" to "service_role";

grant update on table "public"."jobs" to "service_role";

grant delete on table "public"."public_profiles" to "anon";

grant insert on table "public"."public_profiles" to "anon";

grant references on table "public"."public_profiles" to "anon";

grant select on table "public"."public_profiles" to "anon";

grant trigger on table "public"."public_profiles" to "anon";

grant truncate on table "public"."public_profiles" to "anon";

grant update on table "public"."public_profiles" to "anon";

grant delete on table "public"."public_profiles" to "authenticated";

grant insert on table "public"."public_profiles" to "authenticated";

grant references on table "public"."public_profiles" to "authenticated";

grant select on table "public"."public_profiles" to "authenticated";

grant trigger on table "public"."public_profiles" to "authenticated";

grant truncate on table "public"."public_profiles" to "authenticated";

grant update on table "public"."public_profiles" to "authenticated";

grant delete on table "public"."public_profiles" to "service_role";

grant insert on table "public"."public_profiles" to "service_role";

grant references on table "public"."public_profiles" to "service_role";

grant select on table "public"."public_profiles" to "service_role";

grant trigger on table "public"."public_profiles" to "service_role";

grant truncate on table "public"."public_profiles" to "service_role";

grant update on table "public"."public_profiles" to "service_role";

grant delete on table "public"."requirements" to "anon";

grant insert on table "public"."requirements" to "anon";

grant references on table "public"."requirements" to "anon";

grant select on table "public"."requirements" to "anon";

grant trigger on table "public"."requirements" to "anon";

grant truncate on table "public"."requirements" to "anon";

grant update on table "public"."requirements" to "anon";

grant delete on table "public"."requirements" to "authenticated";

grant insert on table "public"."requirements" to "authenticated";

grant references on table "public"."requirements" to "authenticated";

grant select on table "public"."requirements" to "authenticated";

grant trigger on table "public"."requirements" to "authenticated";

grant truncate on table "public"."requirements" to "authenticated";

grant update on table "public"."requirements" to "authenticated";

grant delete on table "public"."requirements" to "service_role";

grant insert on table "public"."requirements" to "service_role";

grant references on table "public"."requirements" to "service_role";

grant select on table "public"."requirements" to "service_role";

grant trigger on table "public"."requirements" to "service_role";

grant truncate on table "public"."requirements" to "service_role";

grant update on table "public"."requirements" to "service_role";

grant delete on table "public"."sensitive_data" to "anon";

grant insert on table "public"."sensitive_data" to "anon";

grant references on table "public"."sensitive_data" to "anon";

grant select on table "public"."sensitive_data" to "anon";

grant trigger on table "public"."sensitive_data" to "anon";

grant truncate on table "public"."sensitive_data" to "anon";

grant update on table "public"."sensitive_data" to "anon";

grant delete on table "public"."sensitive_data" to "authenticated";

grant insert on table "public"."sensitive_data" to "authenticated";

grant references on table "public"."sensitive_data" to "authenticated";

grant select on table "public"."sensitive_data" to "authenticated";

grant trigger on table "public"."sensitive_data" to "authenticated";

grant truncate on table "public"."sensitive_data" to "authenticated";

grant update on table "public"."sensitive_data" to "authenticated";

grant delete on table "public"."sensitive_data" to "service_role";

grant insert on table "public"."sensitive_data" to "service_role";

grant references on table "public"."sensitive_data" to "service_role";

grant select on table "public"."sensitive_data" to "service_role";

grant trigger on table "public"."sensitive_data" to "service_role";

grant truncate on table "public"."sensitive_data" to "service_role";

grant update on table "public"."sensitive_data" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."validations" to "anon";

grant insert on table "public"."validations" to "anon";

grant references on table "public"."validations" to "anon";

grant select on table "public"."validations" to "anon";

grant trigger on table "public"."validations" to "anon";

grant truncate on table "public"."validations" to "anon";

grant update on table "public"."validations" to "anon";

grant delete on table "public"."validations" to "authenticated";

grant insert on table "public"."validations" to "authenticated";

grant references on table "public"."validations" to "authenticated";

grant select on table "public"."validations" to "authenticated";

grant trigger on table "public"."validations" to "authenticated";

grant truncate on table "public"."validations" to "authenticated";

grant update on table "public"."validations" to "authenticated";

grant delete on table "public"."validations" to "service_role";

grant insert on table "public"."validations" to "service_role";

grant references on table "public"."validations" to "service_role";

grant select on table "public"."validations" to "service_role";

grant trigger on table "public"."validations" to "service_role";

grant truncate on table "public"."validations" to "service_role";

grant update on table "public"."validations" to "service_role";


