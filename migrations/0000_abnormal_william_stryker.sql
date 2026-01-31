CREATE TABLE "birth_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_result_id" integer NOT NULL,
	"name" text NOT NULL,
	"gender" text NOT NULL,
	"email" text,
	"birth_year" integer NOT NULL,
	"birth_month" integer NOT NULL,
	"birth_day" integer NOT NULL,
	"birth_hour" integer,
	"birth_minute" integer,
	"birth_time_unknown" boolean DEFAULT false NOT NULL,
	"birth_city" text NOT NULL,
	"birth_country" text,
	"original_timezone" text NOT NULL,
	"original_utc_offset" text,
	"latitude" real,
	"longitude" real,
	"dst_correction_applied" boolean DEFAULT false NOT NULL,
	"consent_marketing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "birth_patterns_survey_result_id_unique" UNIQUE("survey_result_id")
);
--> statement-breakpoint
CREATE TABLE "content_archetypes" (
	"id" text PRIMARY KEY NOT NULL,
	"day_pillar" text NOT NULL,
	"os_type" text NOT NULL,
	"identity_title" text NOT NULL,
	"nature_metaphor" text NOT NULL,
	"nature_description" text NOT NULL,
	"shadow_description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"marketing_consent" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "saju_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"user_input" jsonb NOT NULL,
	"saju_data" jsonb NOT NULL,
	"report_data" jsonb NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "survey_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"answers" jsonb NOT NULL,
	"threat_score" integer NOT NULL,
	"threat_clarity" integer NOT NULL,
	"environment_score" real NOT NULL,
	"environment_stable" integer NOT NULL,
	"agency_score" integer NOT NULL,
	"agency_active" integer NOT NULL,
	"type_key" text NOT NULL,
	"type_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "valid_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"is_reusable" boolean DEFAULT false NOT NULL,
	"used_by_report_id" uuid,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"memo" text,
	CONSTRAINT "valid_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "birth_patterns" ADD CONSTRAINT "birth_patterns_survey_result_id_survey_results_id_fk" FOREIGN KEY ("survey_result_id") REFERENCES "public"."survey_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saju_results" ADD CONSTRAINT "saju_results_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valid_codes" ADD CONSTRAINT "valid_codes_used_by_report_id_saju_results_id_fk" FOREIGN KEY ("used_by_report_id") REFERENCES "public"."saju_results"("id") ON DELETE no action ON UPDATE no action;