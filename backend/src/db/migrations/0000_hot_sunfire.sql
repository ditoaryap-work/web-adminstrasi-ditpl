CREATE TABLE "config" (
	"tim_poksi" varchar(100) PRIMARY KEY NOT NULL,
	"folder_id_spt" varchar(100),
	"folder_id_sptjm" varchar(100),
	"template_id_spt_v1" varchar(100),
	"template_id_spt_v2" varchar(100),
	"template_id_sptjm" varchar(100),
	"folder_id_surat_masuk" varchar(100),
	"folder_id_surat_keluar" varchar(100),
	"folder_id_notulensi" varchar(100),
	"folder_id_spj" varchar(100),
	"template_id_spj" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "pegawai" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(20),
	"nama_lengkap" varchar(200) NOT NULL,
	"nip" varchar(30),
	"golongan" varchar(50),
	"pangkat_gol" varchar(50),
	"tingkat_biaya" varchar(50),
	"jabatan" varchar(200),
	"direktorat" varchar(100),
	"poksi" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pegawai_nip_unique" UNIQUE("nip")
);
--> statement-breakpoint
CREATE TABLE "perjadin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nomor_st" varchar(100),
	"asal_instansi" varchar(200) DEFAULT 'Direktorat PL',
	"nip" varchar(30),
	"nama" varchar(200),
	"pangkat_gol" varchar(50),
	"gol" varchar(10),
	"maksud_tujuan" text,
	"jumlah_dibayar" numeric(14, 2) DEFAULT '0',
	"tujuan" text[],
	"lama_tugas" varchar(50),
	"tgl_berangkat" date,
	"tgl_kembali" date,
	"uang_harian" jsonb DEFAULT '[]'::jsonb,
	"penginapan" jsonb DEFAULT '[]'::jsonb,
	"transport" jsonb DEFAULT '[]'::jsonb,
	"tiket_berangkat" jsonb DEFAULT '[]'::jsonb,
	"tiket_pulang" jsonb DEFAULT '[]'::jsonb,
	"taksi" numeric(12, 2) DEFAULT '0',
	"representasi" numeric(12, 2) DEFAULT '0',
	"uang_lainnya" numeric(12, 2) DEFAULT '0',
	"no_spd" varchar(100),
	"no_akun" varchar(100),
	"jabatan" varchar(200),
	"tingkat_biaya" varchar(50),
	"kendaraan" varchar(100),
	"tgl_perintah" date,
	"tim_poksi" varchar(100) NOT NULL,
	"file_link" text,
	"file_bukti" text,
	"nomor_ls" varchar(100),
	"kode_kapoksi" varchar(100),
	"kode_mak" varchar(100),
	"uraian_pembayaran" text,
	"no_urut_spd" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sbm" (
	"id" serial PRIMARY KEY NOT NULL,
	"kec_kab" varchar(200),
	"uang_harian" numeric(12, 2),
	"uang_penginapan" numeric(12, 2),
	"golongan" varchar(50),
	"pesawat" boolean DEFAULT false,
	"data" jsonb
);
--> statement-breakpoint
CREATE TABLE "spt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"no" varchar(100),
	"tanggal_surat" date,
	"maksud_perjalanan" text,
	"kegiatan" text,
	"mak" varchar(100),
	"peserta" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"peserta_count" smallint DEFAULT 0,
	"tim_poksi" varchar(100) NOT NULL,
	"file_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sptjm" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_lengkap" varchar(200),
	"nip" varchar(30),
	"jabatan" varchar(200),
	"tujuan" varchar(200),
	"tanggal_perjalanan" date,
	"tanggal_kembali" date,
	"tiket_berangkat" numeric(12, 2),
	"tiket_pulang" numeric(12, 2),
	"biaya_sbm" numeric(12, 2),
	"total_biaya" numeric(12, 2),
	"tanggal_ttd" date,
	"tim_poksi" varchar(100) NOT NULL,
	"file_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tim_poksi" varchar(100) NOT NULL,
	"tipe_surat" varchar(20),
	"kategori_surat" varchar(50),
	"sifat_surat" varchar(30),
	"nomor_surat" varchar(100),
	"tanggal_masuk" date,
	"tanggal_surat" date,
	"asal_tujuan" varchar(300),
	"perihal" text,
	"tgl_acara_mulai" date,
	"tgl_acara_selesai" date,
	"disposisi_ke" jsonb DEFAULT '[]'::jsonb,
	"tgl_disposisi" date,
	"tindak_lanjut" text,
	"file_surat" text,
	"file_notulensi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"nama" varchar(150) NOT NULL,
	"tim_poksi" varchar(100) NOT NULL,
	"role" varchar(20) DEFAULT 'Admin' NOT NULL,
	"profile_image" text,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "perjadin" ADD CONSTRAINT "perjadin_tim_poksi_config_tim_poksi_fk" FOREIGN KEY ("tim_poksi") REFERENCES "public"."config"("tim_poksi") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spt" ADD CONSTRAINT "spt_tim_poksi_config_tim_poksi_fk" FOREIGN KEY ("tim_poksi") REFERENCES "public"."config"("tim_poksi") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sptjm" ADD CONSTRAINT "sptjm_tim_poksi_config_tim_poksi_fk" FOREIGN KEY ("tim_poksi") REFERENCES "public"."config"("tim_poksi") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surat" ADD CONSTRAINT "surat_tim_poksi_config_tim_poksi_fk" FOREIGN KEY ("tim_poksi") REFERENCES "public"."config"("tim_poksi") ON DELETE no action ON UPDATE no action;