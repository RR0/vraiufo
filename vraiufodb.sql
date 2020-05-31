--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY en.ufo DROP CONSTRAINT ufo_pk;
DROP TABLE fr.ufo;
DROP TABLE en.ufo;
DROP SCHEMA fr;
DROP SCHEMA en;
--
-- Name: en; Type: SCHEMA; Schema: -; Owner: javarome
--

CREATE SCHEMA en;


ALTER SCHEMA en OWNER TO javarome;

--
-- Name: SCHEMA en; Type: COMMENT; Schema: -; Owner: javarome
--

COMMENT ON SCHEMA en IS 'standard public schema';


--
-- Name: fr; Type: SCHEMA; Schema: -; Owner: javarome
--

CREATE SCHEMA fr;


ALTER SCHEMA fr OWNER TO javarome;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ufo; Type: TABLE; Schema: en; Owner: javarome
--

CREATE TABLE en.ufo (
    id uuid NOT NULL,
    title text,
    media_url character varying(1024)
);


ALTER TABLE en.ufo OWNER TO javarome;

--
-- Name: ufo; Type: TABLE; Schema: fr; Owner: javarome
--

CREATE TABLE fr.ufo
(
    id        uuid NOT NULL,
    title     text,
    media_url character varying(1024)
);


ALTER TABLE fr.ufo
    OWNER TO javarome;

--
-- Data for Name: ufo; Type: TABLE DATA; Schema: en; Owner: javarome
--

COPY en.ufo (id, assertion, media_url) FROM stdin;
90722ad3-8a0a-48ad-bd04-46408dc3ad62	The Roswell autopsy	https://rr0.org/science/crypto/ufo/enquete/dossier/Roswell/Films/2006_Warner.jpg
a8214b61-c7b0-4f2b-b6c9-3aeb8718ff6a	The Roswell crash	https://rr0.org/time/1/9/4/7/07/08/Times.gif
\.


--
-- Data for Name: ufo; Type: TABLE DATA; Schema: fr; Owner: javarome
--

COPY fr.ufo (id, assertion, media_url) FROM stdin;
a8214b61-c7b0-4f2b-b6c9-3aeb8718ff6a	Le crash de Roswell	https://rr0.org/time/1/9/4/7/07/08/Times.gif
90722ad3-8a0a-48ad-bd04-46408dc3ad62	L'autopsie de Roswell	https://rr0.org/science/crypto/ufo/enquete/dossier/Roswell/Films/2006_Warner.jpg
\.


--
-- Name: ufo ufo_pk; Type: CONSTRAINT; Schema: en; Owner: javarome
--

ALTER TABLE ONLY en.ufo
    ADD CONSTRAINT ufo_pk PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

