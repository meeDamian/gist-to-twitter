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
-- Name: updates; Type: TABLE; Schema: public; Owner: cqdgikxopwniav
--

CREATE TABLE updates (
    hash text NOT NULL,
    what text,
    value text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE updates OWNER TO cqdgikxopwniav;

--
-- PostgreSQL database dump complete
--

