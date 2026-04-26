--
-- PostgreSQL database dump
--

\restrict g0cVXawcCFhTF72jFA1C6TmY3x6qic2ZrGLyFtw8awYdlpMV9jYlj0dcOK4O7Si

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: create_next_month_partition(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_next_month_partition() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    -- First day of next month
    start_date := date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    end_date := start_date + INTERVAL '1 month';

    -- Partition name format
    partition_name := 'device_status_logs_y' || to_char(start_date, 'YYYY') || 'm' || to_char(start_date, 'MM');

    -- Check if partition exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE %I PARTITION OF device_status_logs
             FOR VALUES FROM (%L) TO (%L);',
            partition_name, start_date, end_date
        );

        RAISE NOTICE 'Created partition: %', partition_name;
    ELSE
        RAISE NOTICE 'Partition already exists: %', partition_name;
    END IF;
END;
$$;


ALTER FUNCTION public.create_next_month_partition() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alarm_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alarm_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    device_id uuid,
    pole_id uuid,
    switch_id uuid,
    substation_id uuid,
    regulator_id uuid,
    event_type character varying(50) NOT NULL,
    severity character varying(20),
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    message text,
    event_start timestamp without time zone NOT NULL,
    event_end timestamp without time zone,
    acknowledged boolean DEFAULT false,
    acknowledged_by character varying(50),
    acknowledged_at timestamp without time zone,
    source character varying(50),
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_event_type CHECK (((event_type)::text = ANY ((ARRAY['DEVICE_DOWN'::character varying, 'DEVICE_UP'::character varying, 'POWER_FAIL'::character varying, 'POWER_RESTORE'::character varying, 'SWITCH_DOWN'::character varying, 'SWITCH_UP'::character varying, 'LINK_DOWN'::character varying, 'LINK_UP'::character varying])::text[]))),
    CONSTRAINT chk_severity CHECK (((severity)::text = ANY ((ARRAY['CRITICAL'::character varying, 'MAJOR'::character varying, 'MINOR'::character varying, 'INFO'::character varying])::text[]))),
    CONSTRAINT chk_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CLEARED'::character varying])::text[])))
);


ALTER TABLE public.alarm_events OWNER TO postgres;

--
-- Name: device_status_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_status_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    device_id uuid NOT NULL,
    ping_status boolean,
    snmp_status boolean,
    response_time_ms double precision,
    packet_loss double precision,
    cpu_usage double precision,
    memory_usage double precision,
    temperature double precision,
    checked_at timestamp without time zone NOT NULL
)
PARTITION BY RANGE (checked_at);


ALTER TABLE public.device_status_logs OWNER TO postgres;

--
-- Name: device_status_logs_y2026m05; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_status_logs_y2026m05 (
    id uuid DEFAULT public.uuid_generate_v4() CONSTRAINT device_status_logs_id_not_null NOT NULL,
    device_id uuid CONSTRAINT device_status_logs_device_id_not_null NOT NULL,
    ping_status boolean,
    snmp_status boolean,
    response_time_ms double precision,
    packet_loss double precision,
    cpu_usage double precision,
    memory_usage double precision,
    temperature double precision,
    checked_at timestamp without time zone CONSTRAINT device_status_logs_checked_at_not_null NOT NULL
);


ALTER TABLE public.device_status_logs_y2026m05 OWNER TO postgres;

--
-- Name: device_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    category character varying(50),
    description text,
    supports_ping boolean DEFAULT true,
    supports_snmp boolean DEFAULT false,
    requires_power boolean DEFAULT true,
    manufacturer_default character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.device_types OWNER TO postgres;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    device_type_id uuid NOT NULL,
    pole_id uuid,
    switch_id uuid,
    device_name character varying(100) NOT NULL,
    ip_address inet,
    mac_address character varying(50),
    brand character varying(50),
    model character varying(50),
    serial_number character varying(100),
    installation_date date,
    warranty_expiry date,
    vlan_id integer,
    port_number character varying(20),
    status boolean DEFAULT true,
    last_seen timestamp without time zone,
    location text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: poles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pole_number character varying(20) NOT NULL,
    location text,
    regulator_id uuid,
    phase character varying(10),
    latitude numeric(10,6),
    longitude numeric(10,6),
    distance_from_previous double precision,
    installation_date date,
    status boolean DEFAULT true,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.poles OWNER TO postgres;

--
-- Name: power_status_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.power_status_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    substation_id uuid,
    regulator_id uuid,
    pole_id uuid,
    power_available boolean,
    voltage double precision,
    current double precision,
    frequency double precision,
    source character varying(50),
    recorded_at timestamp without time zone NOT NULL
)
PARTITION BY RANGE (recorded_at);


ALTER TABLE public.power_status_logs OWNER TO postgres;

--
-- Name: power_status_logs_default; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.power_status_logs_default (
    id uuid DEFAULT public.uuid_generate_v4() CONSTRAINT power_status_logs_id_not_null NOT NULL,
    substation_id uuid,
    regulator_id uuid,
    pole_id uuid,
    power_available boolean,
    voltage double precision,
    current double precision,
    frequency double precision,
    source character varying(50),
    recorded_at timestamp without time zone CONSTRAINT power_status_logs_recorded_at_not_null NOT NULL
);


ALTER TABLE public.power_status_logs_default OWNER TO postgres;

--
-- Name: power_status_logs_y2026m04; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.power_status_logs_y2026m04 (
    id uuid DEFAULT public.uuid_generate_v4() CONSTRAINT power_status_logs_id_not_null NOT NULL,
    substation_id uuid,
    regulator_id uuid,
    pole_id uuid,
    power_available boolean,
    voltage double precision,
    current double precision,
    frequency double precision,
    source character varying(50),
    recorded_at timestamp without time zone CONSTRAINT power_status_logs_recorded_at_not_null NOT NULL
);


ALTER TABLE public.power_status_logs_y2026m04 OWNER TO postgres;

--
-- Name: substations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.substations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    location text,
    ht_panel_status boolean,
    lt_panel_status boolean,
    ups_status boolean,
    dg_status boolean,
    transformer_status boolean,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.substations OWNER TO postgres;

--
-- Name: switches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.switches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    ip_address inet NOT NULL,
    mac_address character varying(50),
    switch_type character varying(20),
    location text,
    pole_id uuid,
    parent_switch_id uuid,
    total_ports integer,
    used_ports integer,
    status boolean,
    last_seen timestamp without time zone,
    snmp_enabled boolean DEFAULT true,
    firmware_version character varying(50),
    brand character varying(50),
    model character varying(50),
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.switches OWNER TO postgres;

--
-- Name: voltage_regulators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voltage_regulators (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    substation_id uuid,
    name character varying(50),
    input_voltage double precision,
    output_voltage double precision,
    capacity_kva double precision,
    status boolean,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.voltage_regulators OWNER TO postgres;

--
-- Name: device_status_logs_y2026m05; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_logs ATTACH PARTITION public.device_status_logs_y2026m05 FOR VALUES FROM ('2026-05-01 00:00:00') TO ('2026-06-01 00:00:00');


--
-- Name: power_status_logs_default; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_status_logs ATTACH PARTITION public.power_status_logs_default DEFAULT;


--
-- Name: power_status_logs_y2026m04; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_status_logs ATTACH PARTITION public.power_status_logs_y2026m04 FOR VALUES FROM ('2026-04-01 00:00:00') TO ('2026-05-01 00:00:00');


--
-- Data for Name: alarm_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alarm_events (id, device_id, pole_id, switch_id, substation_id, regulator_id, event_type, severity, status, message, event_start, event_end, acknowledged, acknowledged_by, acknowledged_at, source, remarks, created_at) FROM stdin;
\.


--
-- Data for Name: device_status_logs_y2026m05; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_status_logs_y2026m05 (id, device_id, ping_status, snmp_status, response_time_ms, packet_loss, cpu_usage, memory_usage, temperature, checked_at) FROM stdin;
\.


--
-- Data for Name: device_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_types (id, name, category, description, supports_ping, supports_snmp, requires_power, manufacturer_default, created_at) FROM stdin;
0d73df91-4d99-4f51-96b1-2c5b7fdaacb2	PTZ Camera	CAMERA	\N	t	t	t	\N	2026-04-26 17:52:24.961997
698adb24-5cd1-47d0-bad5-20c95a32628c	Field Switch	NETWORK	\N	t	t	t	\N	2026-04-26 17:52:24.961997
dd7a4ec5-9ff4-4d83-bb2f-9ef0dc698f6f	Distribution Switch	NETWORK	\N	t	t	t	\N	2026-04-26 17:52:24.961997
822fe5cb-43a8-415b-9e4e-aa9c99fed5a1	Core Switch	NETWORK	\N	t	t	t	\N	2026-04-26 17:52:24.961997
caf344c5-7a3c-4465-ab0a-d26222141b58	IO Controller	CONTROLLER	\N	t	f	t	\N	2026-04-26 17:52:24.961997
cc4f2d94-5cfa-4dc2-b9ce-842aa2ea558c	Master Controller	CONTROLLER	\N	t	f	t	\N	2026-04-26 17:52:24.961997
37ceba3b-f19d-4fca-be6a-21a854573059	Hooter	SECURITY	\N	f	f	t	\N	2026-04-26 17:52:24.961997
14658fdb-d1f8-4960-bb0e-f005d046a9ca	Strobe	SECURITY	\N	f	f	t	\N	2026-04-26 17:52:24.961997
fc38b0bb-bab0-4913-9bbb-a984d7fae064	Fixed Camera	CAMERA		t	t	t	INFINOVA	2026-04-26 17:52:24.961997
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, device_type_id, pole_id, switch_id, device_name, ip_address, mac_address, brand, model, serial_number, installation_date, warranty_expiry, vlan_id, port_number, status, last_seen, location, remarks, created_at) FROM stdin;
7c513ec5-2abd-4896-9cda-ac4ce2eb9c81	fc38b0bb-bab0-4913-9bbb-a984d7fae064	1688455a-cd3f-4e21-b6e5-c5288b4abcf8	2202fc2a-fb21-4a70-ae1e-5f4e5cbd541a	FC 001	172.20.27.41					\N	\N	\N	\N	t	\N	P1		2026-04-26 19:08:27.750946
\.


--
-- Data for Name: poles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poles (id, pole_number, location, regulator_id, phase, latitude, longitude, distance_from_previous, installation_date, status, remarks, created_at) FROM stdin;
c0ee5a8a-c9d9-4c6f-bd54-feb1b28b18b2	P036	P036	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t		2026-04-26 19:46:03.173226
1688455a-cd3f-4e21-b6e5-c5288b4abcf8	P001	P1	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	0	2026-03-31	t		2026-04-26 19:07:45.468565
fc163779-616d-4630-9c7b-e09dbe282cd1	P002	P2	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
ad9615d2-054c-4c62-9450-cda8940e3b89	P003	P3	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
72011ff1-3ff0-43b1-beea-6b89e2b37f60	P004	P4	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
cc49da8a-bdc2-46a5-ba75-b8377567332e	P005	P5	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
93021ebb-a4a8-4676-9c47-680f3a5b2435	P006	P6	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
16728b08-4146-44c2-83aa-77e3bb291239	P007	P7	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
0d3eda4b-f9fc-4e53-bdcb-afa93c634b31	P008	P8	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
51efbb10-cffe-40ea-b4d8-c29ed94c9e3b	P009	P9	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
e8bbe172-72d3-45c7-847c-cd344a245387	P010	P10	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
632762a5-763f-437a-ac4a-be7b79be4e34	P011	P11	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
e3658e5a-be43-4c0f-ac17-e65c1a78e5d2	P012	P12	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
6e7ad861-61fb-45ab-b86b-c24737b9fe64	P013	P13	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
6e8417ce-727a-480d-9d85-02894425fa9e	P014	P14	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
9a8237c7-bcce-4290-882d-383955038ad7	P015	P15	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
6aaff6cb-ae8c-4bc5-9699-9552d3fdccb4	P016	P16	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
6169659d-e9ce-4cac-b0f1-2c0f2229969e	P017	P17	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
1b60b8f5-3d80-4eaa-9dee-528109dc1235	P018	P18	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
c48ead27-f28b-47ef-9924-8d0673eca341	P019	P19	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
f57d0903-b2ae-4b3e-8ec6-ccb3d87ba31f	P020	P20	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
3f56ca02-5729-4339-853e-b457de500b66	P021	P21	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
187e67d5-a078-424a-83b9-df405fbf9728	P022	P22	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
cc2aaa90-655e-416f-8beb-eb23be60abf2	P023	P23	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
bfd2338e-7833-4b83-816f-3b055121bb20	P024	P24	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
b9368401-0f76-4534-bc79-2f7264a5661a	P025	P25	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
450ebc8c-161d-4e5e-8753-343f1cc6b1e7	P026	P26	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
956049cd-ae94-4831-bf15-60c29d8de63c	P027	P27	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
6ef403ed-5b31-48e7-8398-5c09f40534b1	P028	P28	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
719ca8f1-63f5-4f57-bf0a-f13c79f0443a	P029	P29	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
830a0b7f-5470-4ac4-a365-ac41f927eb59	P030	P30	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
9fd5d854-1f25-40cb-bb72-8c4cf5dc11ca	P031	P31	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
e08afd81-2b98-4357-9c89-7fd4eb20476c	P032	P32	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
a8a38fef-54d2-4ed5-a508-ba48116e7f91	P033	P33	b969fabf-11d9-4650-a4ab-2bd2aefb917f	BLUE	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
2efd48bd-7738-49f4-b85f-65c81ab9a933	P034	P34	b969fabf-11d9-4650-a4ab-2bd2aefb917f	RED	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
df7af770-3f91-4ebf-acfd-2a9b895b6676	P035	P35	b969fabf-11d9-4650-a4ab-2bd2aefb917f	YELLOW	\N	\N	50	2026-03-31	t	\N	2026-04-26 19:36:20.162239
641d93d5-32b9-4bfe-bd9b-410d1c405593	P037	P037	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
ae6a8a5e-5ba5-4721-8611-dd3db37923d4	P038	P038	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
d6592af6-41ce-43ea-8d8e-0dca1ce3cc84	P039	P039	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
9541ee9a-7977-443a-9a70-14a622788593	P040	P040	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
2491eb98-d388-4b98-a692-07ddc81cc668	P041	P041	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
2e42808c-6097-4894-8ba7-74743207cb9f	P042	P042	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
895cd1df-cf61-48d7-ba9d-73422657b13a	P043	P043	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
63506763-4b6b-467c-b0d1-c81afdc2b505	P044	P044	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
3c414a34-d477-45d8-b058-6d14e482d8fb	P045	P045	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
473da5d4-94e2-4a95-a06f-61e4fd0fc250	P046	P046	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
d0745f40-14ef-4a39-8e7c-2e146426610e	P047	P047	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
bb560f65-fcb8-4793-aafe-e8a84f7cb9ec	P048	P048	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
9e174045-67aa-43ae-8dbe-0fc57fef9283	P049	P049	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
bd90c181-8bab-45a6-bb8b-92cb51471026	P050	P050	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
5bf2dffb-ca4f-4dbc-b56a-e2ccb92639b9	P051	P051	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
46cb345b-4ddb-4acc-a658-d8617238a26f	P052	P052	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
49b3e8ab-7a1c-421c-986f-33ec23f4d221	P053	P053	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
ce6e0319-d0a4-432b-be71-b2fa9eb84834	P054	P054	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
0b4be0ba-7263-4696-bb61-67affe3bdadd	P055	P055	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
525dd667-047e-4fd2-890b-1df4a6a47eca	P056	P056	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
98b974a4-41d7-4c55-b01d-43364b6f7779	P057	P057	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
c0d8e553-22d8-488e-93de-85657542158b	P058	P058	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
61f1e637-c4dd-4cc7-9193-719ee529eef7	P059	P059	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
16a4753b-e824-4b33-a9e5-e85716aa113d	P060	P060	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
25f85903-da65-41c4-bad8-3a978ce7d600	P061	P061	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
cb358365-f860-4b11-aec6-5dd691680d81	P062	P062	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
935b2a11-5610-44f2-9767-d16e33a0f93f	P063	P063	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
31cb60f9-edec-499e-94bb-0a82c9f6e499	P064	P064	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	RED	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
e2d014c3-f303-4a6c-984a-adbc8c0e50c8	P065	P065	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	YELLOW	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
6e078750-eca0-4178-b211-64369f6796cb	P066	P066	bc2b0e64-41f1-4baf-86c2-729dc913a9b3	BLUE	\N	\N	\N	2026-04-01	t	\N	2026-04-26 19:47:54.323743
c5e1e010-f7c8-4b81-84db-a865c5d2efd9	P067	P067	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t		2026-04-26 19:49:48.586022
64f7ef2f-8523-4465-a7a0-9a53e7aef0dc	P068	P068	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
f509aae7-0e4c-4576-8cae-2c7dd7b22995	P069	P069	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
3b583a89-90f0-4cdd-9982-36572e2590c9	P070	P070	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
6281c896-f6ca-489e-8d83-1fad547ce5a9	P071	P071	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
5d26f466-270d-4076-8b88-5b9d9c731d2b	P072	P072	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
d58b8484-6b2f-40bf-8334-b1ade157f02a	P073	P073	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
c3252ed2-68c3-432c-bb0f-ba59c98bfedc	P074	P074	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
49ff913e-f582-4aa7-9e8a-a0a6e52522f5	P075	P075	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
0d02cfcb-0edd-4109-ac85-f179bf2481cf	P076	P076	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
d1c6a248-2d8d-46e8-a298-010e459d743c	P077	P077	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
e24c61ca-2574-4aaf-a2c7-42394e69b324	P078	P078	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
fb79b64f-c9bd-44cc-8e7e-1e4babd1cce8	P079	P079	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
220e3fdc-9086-4f86-a488-91e7d64a5e21	P080	P080	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
a8772f89-c457-4b6b-b19e-e697e53e9f26	P081	P081	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
160131cd-bfbd-46c7-99ad-d0bc45bf9aac	P082	P082	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
c1730014-6d53-40fd-879a-0c8e8edfcf55	P083	P083	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
ddf59ebe-1c29-4341-ad1f-dd184c637c40	P084	P084	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
e6fb75ff-0793-48f2-861f-fa8394f51f53	P085	P085	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
3f79e075-129a-469f-b406-d708e1790bee	P086	P086	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
000dce27-cf90-4f7c-a456-ea7cd3b8f629	P087	P087	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
9135d0cc-1fd3-46e7-aa2b-a356a74e9b3c	P088	P088	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
752cbf01-4ee3-4d8e-989a-bbcca8912ef6	P089	P089	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
9cc5a032-64fb-40c1-a496-9e60eaaab9b1	P090	P090	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
fcb2d5cd-dd75-4b2d-a47e-273cee3c25c5	P091	P091	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
91f01e7a-3192-4aa8-a9a3-879bc5a26945	P092	P092	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
d92905f5-9020-45d7-a10a-f03701a5aaf8	P093	P093	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
def16eb5-d8a0-4b6c-9ecf-30db3d4363a7	P094	P094	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
02058277-4b2f-43f1-8835-bf63f8539858	P095	P095	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
9a137c73-551c-410b-aa09-a89e59a66cd7	P096	P096	430e80ad-9213-49de-b0b8-85e6153e6283	BLUE	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
f3ba11ba-0d8d-485d-a25b-1e7c1b8b3983	P097	P097	430e80ad-9213-49de-b0b8-85e6153e6283	RED	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
dc8ea41c-b2c2-4973-b9ee-e78bdf9cf5d7	P098	P098	430e80ad-9213-49de-b0b8-85e6153e6283	YELLOW	\N	\N	\N	\N	t	\N	2026-04-26 19:51:22.730485
\.


--
-- Data for Name: power_status_logs_default; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.power_status_logs_default (id, substation_id, regulator_id, pole_id, power_available, voltage, current, frequency, source, recorded_at) FROM stdin;
\.


--
-- Data for Name: power_status_logs_y2026m04; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.power_status_logs_y2026m04 (id, substation_id, regulator_id, pole_id, power_available, voltage, current, frequency, source, recorded_at) FROM stdin;
\.


--
-- Data for Name: substations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.substations (id, name, location, ht_panel_status, lt_panel_status, ups_status, dg_status, transformer_status, last_updated, created_at) FROM stdin;
b610a512-c73a-4a43-8ed1-1d8c4861520b	Power Station 1	Military Engineering Services	t	t	t	t	t	2026-04-26 18:44:01.911046	2026-04-26 18:44:01.911046
219ce0b9-f15a-4fda-a6f3-0665827e842d	Power Station 2	Watch Tower 11	t	t	t	t	t	2026-04-26 18:44:27.187645	2026-04-26 18:44:27.187645
dc8941ad-f75d-475e-aac5-2f16be8b8aad	Power Station 3	Watch Tower 20	t	t	t	t	t	2026-04-26 19:25:17.618233	2026-04-26 19:25:17.618233
60b53789-9c09-4d38-9e07-5d937b406acb	Power Station 4	Watch Tower 27	t	t	t	t	t	2026-04-26 19:25:40.254105	2026-04-26 19:25:40.254105
1abfd22c-ecd6-4617-8ec7-fea325c944c6	Power Station 5	Watch Tower 37	t	t	t	t	t	2026-04-26 19:26:02.876238	2026-04-26 19:26:02.876238
47be18d1-761e-4709-9907-96063a0aa937	Power Station 6	C2 Building	t	t	t	t	t	2026-04-26 19:26:20.982948	2026-04-26 19:26:20.982948
bdbf381a-029d-4d1b-9aa1-2b9d94da3d29	Power Station 7	ATC	t	t	t	t	t	2026-04-26 19:26:36.493918	2026-04-26 19:26:36.493918
ecdf051d-783b-4525-9f18-a67955e49b9c	Power Station 8	MSCP Parking Shed	t	t	t	t	t	2026-04-26 19:27:00.813204	2026-04-26 19:27:00.813204
81bec754-f7c2-4e84-9741-d8b245c4078c	Power Station 9	WTS	t	t	t	t	t	2026-04-26 19:27:20.637735	2026-04-26 19:27:20.637735
\.


--
-- Data for Name: switches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.switches (id, name, ip_address, mac_address, switch_type, location, pole_id, parent_switch_id, total_ports, used_ports, status, last_seen, snmp_enabled, firmware_version, brand, model, remarks, created_at) FROM stdin;
2202fc2a-fb21-4a70-ae1e-5f4e5cbd541a	ACCESS SWITCH 001	172.20.27.21		FIELD		1688455a-cd3f-4e21-b6e5-c5288b4abcf8	\N	10	\N	t	\N	t	\N				2026-04-26 19:09:26.104404
\.


--
-- Data for Name: voltage_regulators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voltage_regulators (id, substation_id, name, input_voltage, output_voltage, capacity_kva, status, last_updated, created_at) FROM stdin;
3a405df0-fc00-40c3-9a51-a1e8cf61e7d1	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-1	440	440	15	t	2026-04-26 18:45:17.825058	2026-04-26 18:45:17.825058
b969fabf-11d9-4650-a4ab-2bd2aefb917f	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-2	440	440	15	t	2026-04-26 18:45:49.504284	2026-04-26 18:45:49.504284
bc2b0e64-41f1-4baf-86c2-729dc913a9b3	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-3	440	440	15	t	2026-04-26 19:43:41.979761	2026-04-26 19:43:41.979761
430e80ad-9213-49de-b0b8-85e6153e6283	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-4	440	440	15	t	2026-04-26 19:44:00.404575	2026-04-26 19:44:00.404575
366301e8-7374-4a6d-95c7-a2547f947bf7	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-5	440	440	15	t	2026-04-26 19:44:21.043518	2026-04-26 19:44:21.043518
f4b3eab5-07e0-4f14-8ca9-268655bacd78	b610a512-c73a-4a43-8ed1-1d8c4861520b	Voltage Regulator 1-6	440	440	15	t	2026-04-26 19:44:47.486188	2026-04-26 19:44:47.486188
\.


--
-- Name: alarm_events alarm_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_pkey PRIMARY KEY (id);


--
-- Name: device_status_logs device_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_logs
    ADD CONSTRAINT device_status_logs_pkey PRIMARY KEY (id, checked_at);


--
-- Name: device_status_logs_y2026m05 device_status_logs_y2026m05_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_logs_y2026m05
    ADD CONSTRAINT device_status_logs_y2026m05_pkey PRIMARY KEY (id, checked_at);


--
-- Name: device_types device_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_types
    ADD CONSTRAINT device_types_name_key UNIQUE (name);


--
-- Name: device_types device_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_types
    ADD CONSTRAINT device_types_pkey PRIMARY KEY (id);


--
-- Name: devices devices_device_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_device_name_key UNIQUE (device_name);


--
-- Name: devices devices_ip_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_ip_address_key UNIQUE (ip_address);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: poles poles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT poles_pkey PRIMARY KEY (id);


--
-- Name: poles poles_pole_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT poles_pole_number_key UNIQUE (pole_number);


--
-- Name: power_status_logs power_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_status_logs
    ADD CONSTRAINT power_status_logs_pkey PRIMARY KEY (id, recorded_at);


--
-- Name: power_status_logs_default power_status_logs_default_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_status_logs_default
    ADD CONSTRAINT power_status_logs_default_pkey PRIMARY KEY (id, recorded_at);


--
-- Name: power_status_logs_y2026m04 power_status_logs_y2026m04_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.power_status_logs_y2026m04
    ADD CONSTRAINT power_status_logs_y2026m04_pkey PRIMARY KEY (id, recorded_at);


--
-- Name: substations substations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.substations
    ADD CONSTRAINT substations_pkey PRIMARY KEY (id);


--
-- Name: switches switches_ip_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_ip_address_key UNIQUE (ip_address);


--
-- Name: switches switches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_pkey PRIMARY KEY (id);


--
-- Name: voltage_regulators voltage_regulators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voltage_regulators
    ADD CONSTRAINT voltage_regulators_pkey PRIMARY KEY (id);


--
-- Name: idx_alarm_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alarm_active ON public.alarm_events USING btree (status);


--
-- Name: idx_alarm_device; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alarm_device ON public.alarm_events USING btree (device_id);


--
-- Name: idx_alarm_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alarm_time ON public.alarm_events USING btree (event_start DESC);


--
-- Name: idx_devices_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_ip ON public.devices USING btree (ip_address);


--
-- Name: idx_devices_pole; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_pole ON public.devices USING btree (pole_id);


--
-- Name: idx_devices_switch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_switch ON public.devices USING btree (switch_id);


--
-- Name: idx_devices_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_type ON public.devices USING btree (device_type_id);


--
-- Name: idx_power_logs_main; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_power_logs_main ON public.power_status_logs_y2026m04 USING btree (substation_id, regulator_id, recorded_at DESC);


--
-- Name: device_status_logs_y2026m05_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.device_status_logs_pkey ATTACH PARTITION public.device_status_logs_y2026m05_pkey;


--
-- Name: power_status_logs_default_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.power_status_logs_pkey ATTACH PARTITION public.power_status_logs_default_pkey;


--
-- Name: power_status_logs_y2026m04_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.power_status_logs_pkey ATTACH PARTITION public.power_status_logs_y2026m04_pkey;


--
-- Name: alarm_events alarm_events_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE SET NULL;


--
-- Name: alarm_events alarm_events_pole_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_pole_id_fkey FOREIGN KEY (pole_id) REFERENCES public.poles(id) ON DELETE SET NULL;


--
-- Name: alarm_events alarm_events_regulator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_regulator_id_fkey FOREIGN KEY (regulator_id) REFERENCES public.voltage_regulators(id) ON DELETE SET NULL;


--
-- Name: alarm_events alarm_events_substation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_substation_id_fkey FOREIGN KEY (substation_id) REFERENCES public.substations(id) ON DELETE SET NULL;


--
-- Name: alarm_events alarm_events_switch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alarm_events
    ADD CONSTRAINT alarm_events_switch_id_fkey FOREIGN KEY (switch_id) REFERENCES public.switches(id) ON DELETE SET NULL;


--
-- Name: device_status_logs device_status_logs_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.device_status_logs
    ADD CONSTRAINT device_status_logs_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: devices devices_device_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_device_type_id_fkey FOREIGN KEY (device_type_id) REFERENCES public.device_types(id);


--
-- Name: devices devices_pole_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pole_id_fkey FOREIGN KEY (pole_id) REFERENCES public.poles(id) ON DELETE SET NULL;


--
-- Name: devices devices_switch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_switch_id_fkey FOREIGN KEY (switch_id) REFERENCES public.switches(id) ON DELETE SET NULL;


--
-- Name: poles poles_regulator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poles
    ADD CONSTRAINT poles_regulator_id_fkey FOREIGN KEY (regulator_id) REFERENCES public.voltage_regulators(id) ON DELETE SET NULL;


--
-- Name: power_status_logs power_status_logs_pole_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.power_status_logs
    ADD CONSTRAINT power_status_logs_pole_id_fkey FOREIGN KEY (pole_id) REFERENCES public.poles(id) ON DELETE SET NULL;


--
-- Name: power_status_logs power_status_logs_regulator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.power_status_logs
    ADD CONSTRAINT power_status_logs_regulator_id_fkey FOREIGN KEY (regulator_id) REFERENCES public.voltage_regulators(id) ON DELETE SET NULL;


--
-- Name: power_status_logs power_status_logs_substation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.power_status_logs
    ADD CONSTRAINT power_status_logs_substation_id_fkey FOREIGN KEY (substation_id) REFERENCES public.substations(id) ON DELETE SET NULL;


--
-- Name: switches switches_parent_switch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_parent_switch_id_fkey FOREIGN KEY (parent_switch_id) REFERENCES public.switches(id) ON DELETE SET NULL;


--
-- Name: switches switches_pole_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.switches
    ADD CONSTRAINT switches_pole_id_fkey FOREIGN KEY (pole_id) REFERENCES public.poles(id) ON DELETE SET NULL;


--
-- Name: voltage_regulators voltage_regulators_substation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voltage_regulators
    ADD CONSTRAINT voltage_regulators_substation_id_fkey FOREIGN KEY (substation_id) REFERENCES public.substations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict g0cVXawcCFhTF72jFA1C6TmY3x6qic2ZrGLyFtw8awYdlpMV9jYlj0dcOK4O7Si

