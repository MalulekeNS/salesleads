-- ==============================================
-- LeadsHub - Database Setup
-- ==============================================

-- Users Table (Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users(email);

-- Lead Status Enum
CREATE TYPE lead_status AS ENUM (
    'New', 
    'Engaged', 
    'Proposal Sent', 
    'Closed-Won', 
    'Closed-Lost'
);

-- Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lead_number SERIAL,
    display_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status lead_status NOT NULL DEFAULT 'New',
    company TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_lead_display_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.display_id := 'LD-' || LPAD(NEW.lead_number::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_lead_display_id_trigger
    BEFORE INSERT ON public.leads
    FOR EACH ROW EXECUTE FUNCTION generate_lead_display_id();

CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample Test User (password: test123)
INSERT INTO public.users (id, email, password_hash) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'demo@leadshub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.j0Y2x.8Y3e.1y2XjWi');

-- Sample Leads
INSERT INTO public.leads (user_id, name, email, status, company, phone, notes) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'John Smith', 'john.smith@techinnovate.co.za', 'Engaged', 'Tech Innovate', '+27 84 012 3456', 'Interested in enterprise plan.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sarah Johnson', 'sarah.j@greenfields.com', 'Proposal Sent', 'GreenFields Ltd', '+27 72 345 6789', 'Sent pricing proposal.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Michael Brown', 'mbrown@startupza.io', 'New', 'StartupZA', '+27 83 567 8901', 'Needs demo.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lisa van der Berg', 'lisa@capefinance.co.za', 'Closed-Won', 'Cape Finance', '+27 21 890 1234', 'Signed contract.'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'David Nkosi', 'dnkosi@jhblogistics.com', 'Closed-Lost', 'JHB Logistics', '+27 11 234 5678', 'Budget constraints.');
