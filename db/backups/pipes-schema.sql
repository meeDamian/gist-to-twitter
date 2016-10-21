--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.4
-- Dumped by pg_dump version 9.5.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: pipes; Type: TABLE; Schema: public; Owner: cqdgikxopwniav
--

CREATE TABLE pipes (
    gist text NOT NULL,
    twitter_token text,
    twitter_secret text,
    gh_token text,
    hash text
);


ALTER TABLE pipes OWNER TO cqdgikxopwniav;

--
-- Name: pipes_hash_key; Type: CONSTRAINT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY pipes
    ADD CONSTRAINT pipes_hash_key UNIQUE (hash);


--
-- Name: pipes_pkey; Type: CONSTRAINT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY pipes
    ADD CONSTRAINT pipes_pkey PRIMARY KEY (gist);


--
-- PostgreSQL database dump complete
--

