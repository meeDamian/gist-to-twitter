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
-- Name: update; Type: TABLE; Schema: public; Owner: cqdgikxopwniav
--

CREATE TABLE update (
    id integer NOT NULL,
    gist text NOT NULL,
    country text,
    city text,
    phone text,
    at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE update OWNER TO cqdgikxopwniav;

--
-- Name: update_id_seq; Type: SEQUENCE; Schema: public; Owner: cqdgikxopwniav
--

CREATE SEQUENCE update_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE update_id_seq OWNER TO cqdgikxopwniav;

--
-- Name: update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cqdgikxopwniav
--

ALTER SEQUENCE update_id_seq OWNED BY update.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY update ALTER COLUMN id SET DEFAULT nextval('update_id_seq'::regclass);


--
-- Name: update_pkey; Type: CONSTRAINT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY update
    ADD CONSTRAINT update_pkey PRIMARY KEY (id);


--
-- Name: update_gist_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY update
    ADD CONSTRAINT update_gist_fkey FOREIGN KEY (gist) REFERENCES pipes(gist);


--
-- PostgreSQL database dump complete
--

