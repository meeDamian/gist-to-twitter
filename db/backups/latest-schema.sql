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
-- Name: latest; Type: TABLE; Schema: public; Owner: cqdgikxopwniav
--

CREATE TABLE latest (
    hash text NOT NULL,
    city text,
    country text,
    phone text,
    vanity text,
    relocated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE latest OWNER TO cqdgikxopwniav;

--
-- Name: latest_pkey; Type: CONSTRAINT; Schema: public; Owner: cqdgikxopwniav
--

ALTER TABLE ONLY latest
    ADD CONSTRAINT latest_pkey PRIMARY KEY (hash);


--
-- Name: uniquehashindex; Type: INDEX; Schema: public; Owner: cqdgikxopwniav
--

CREATE UNIQUE INDEX uniquehashindex ON latest USING btree (lower(hash));


--
-- Name: uniquevanityindex; Type: INDEX; Schema: public; Owner: cqdgikxopwniav
--

CREATE UNIQUE INDEX uniquevanityindex ON latest USING btree (lower(vanity));


--
-- Name: log_inserts_trigger; Type: TRIGGER; Schema: public; Owner: cqdgikxopwniav
--

CREATE TRIGGER log_inserts_trigger BEFORE INSERT ON latest FOR EACH ROW EXECUTE PROCEDURE log_inserts();


--
-- Name: log_updates_trigger; Type: TRIGGER; Schema: public; Owner: cqdgikxopwniav
--

CREATE TRIGGER log_updates_trigger BEFORE UPDATE ON latest FOR EACH ROW EXECUTE PROCEDURE log_updates();


--
-- Name: save_location_update; Type: TRIGGER; Schema: public; Owner: cqdgikxopwniav
--

CREATE TRIGGER save_location_update BEFORE UPDATE ON latest FOR EACH ROW EXECUTE PROCEDURE attach_location_update_date();


--
-- Name: save_vanity_update; Type: TRIGGER; Schema: public; Owner: cqdgikxopwniav
--

CREATE TRIGGER save_vanity_update BEFORE INSERT OR UPDATE ON latest FOR EACH ROW EXECUTE PROCEDURE process_vanity();


--
-- PostgreSQL database dump complete
--

