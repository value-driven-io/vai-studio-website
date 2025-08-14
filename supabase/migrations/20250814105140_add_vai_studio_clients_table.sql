-- Migration: Add VAI Studio Clients table (Enhanced Version 2 - Smart Bilingual)
-- Purpose: Store client portal data separate from VAI Operator system
-- Approach: Comprehensive structure + selective bilingual for controlled content
-- Date: 2025-08-14

-- Create vai_studio_clients table
CREATE TABLE IF NOT EXISTS public.vai_studio_clients (
  -- Primary identifiers
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Client identity & URL structure
  client_name varchar(255) NOT NULL,           -- "manea-lagoon-adventures"
  company_name varchar(255) NOT NULL,          -- "Manea Lagoon Adventures"
  slug varchar(100) UNIQUE NOT NULL,           -- URL slug: clients/manea-lagoon-adventures
  
  -- Contact information
  primary_contact varchar(255) NOT NULL,       -- "Teva"
  email varchar(255) NOT NULL,                 -- Client's email
  whatsapp varchar(50),                        -- WhatsApp number
  phone varchar(50),                           -- Phone number
  island varchar(100),                         -- Primary island (Tahiti, Moorea, etc.)
  
  -- Project & proposal data (SMART COMPREHENSIVE JSON)
  proposal_data jsonb NOT NULL DEFAULT '{}',   -- Comprehensive but smart bilingual structure
  project_status varchar(50) DEFAULT 'proposal' NOT NULL, -- proposal|active|completed|paused|cancelled
  total_investment_xpf integer,                -- Total project cost
  monthly_costs_xpf integer,                   -- Monthly operational costs
  
  -- Timeline & milestones
  proposed_start_date date,                    -- When project should start
  estimated_completion_date date,              -- When project should be completed
  actual_start_date date,                      -- When project actually started
  actual_completion_date date,                 -- When project was actually completed
  
  -- Access control & security
  access_password varchar(255),                -- Simple password protection (Phase 1)
  access_token varchar(255),                   -- Secure access token (alternative to password)
  auth_user_id uuid REFERENCES auth.users(id), -- Future Supabase Auth integration
  is_active boolean DEFAULT true NOT NULL,     -- Client portal active/inactive
  
  -- Communication & documents
  notes text,                                  -- Internal notes
  last_communication_date timestamptz,         -- Last contact with client
  
  -- Metadata & tracking
  last_accessed_at timestamptz,               -- When client last viewed their portal
  last_updated_by varchar(100),               -- Who made last update (system|kevin|client)
  portal_views integer DEFAULT 0,             -- Track portal engagement
  
  -- Constraints
  CONSTRAINT vai_studio_clients_project_status_check 
    CHECK (project_status IN ('proposal', 'active', 'completed', 'paused', 'cancelled')),
  CONSTRAINT vai_studio_clients_email_format_check 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT vai_studio_clients_slug_format_check 
    CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_vai_studio_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vai_studio_clients_updated_at
  BEFORE UPDATE ON public.vai_studio_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vai_studio_clients_updated_at();

-- Create indexes for performance
CREATE INDEX idx_vai_studio_clients_slug ON public.vai_studio_clients(slug);
CREATE INDEX idx_vai_studio_clients_email ON public.vai_studio_clients(email);
CREATE INDEX idx_vai_studio_clients_status ON public.vai_studio_clients(project_status);
CREATE INDEX idx_vai_studio_clients_auth_user ON public.vai_studio_clients(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_vai_studio_clients_active ON public.vai_studio_clients(is_active) WHERE is_active = true;
CREATE INDEX idx_vai_studio_clients_island ON public.vai_studio_clients(island);

-- Row Level Security (RLS) policies
ALTER TABLE public.vai_studio_clients ENABLE ROW LEVEL SECURITY;

-- Policy: Kevin (admin) can do everything
CREATE POLICY "Kevin can manage all VAI Studio clients"
  ON public.vai_studio_clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Public can view active clients (for password-protected access)
CREATE POLICY "Public can view active client portals"
  ON public.vai_studio_clients
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policy: Future auth integration - clients can view their own data
CREATE POLICY "Clients can view own data"
  ON public.vai_studio_clients
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Insert Teva's comprehensive data with smart bilingual structure
INSERT INTO public.vai_studio_clients (
  client_name,
  company_name,
  slug,
  primary_contact,
  email,
  whatsapp,
  island,
  project_status,
  total_investment_xpf,
  monthly_costs_xpf,
  access_password,
  proposed_start_date,
  estimated_completion_date,
  proposal_data,
  notes
) VALUES (
  'manea-lagoon-adventures',
  'Manea Lagoon Adventures',
  'manea-lagoon-adventures',
  'Teva',
  'manealagoonadventures@gmail.com',
  '+68987201801',
  'Tahiti',
  'proposal',
  250000,
  5400,
  'maneaVAI2025',
  '2025-08-20',  -- Proposed start date
  '2025-09-10',  -- 3 weeks later
  '{
    "proposal_meta": {
      "version": "2.0",
      "created_date": "2025-08-14",
      "proposal_type": "smart_setup",
      "default_language": "fr",
      "available_languages": ["fr", "en"],
      "currency": "XPF",
      "client_preferences": {
        "informal_tone": true,
        "polynesian_style": true
      }
    },
    
    "client_business": {
      "business_type": "lagoon_excursions",
      "tour_types": ["lagoon_adventures", "island_hopping", "snorkeling"],
      "islands_served": ["Tahiti"],
      "languages_spoken": ["French", "Tahitian"],
      "target_market": ["tourists", "couples", "families"],
      "target_bookings_monthly": 20,
      "business_experience": "startup",
      "peak_season": ["June", "July", "August", "December"]
    },
    
    "package_selection": {
      "selected_package": "smart_setup",
      "total_investment": 250000,
      "monthly_operating_costs": 5400,
      "timeline_weeks": 3,
      "recommended": true
    },
    
    "cost_breakdown": {
      "website_development": {
        "amount": 180000,
        "label": {
          "fr": "Conception et développement du site web",
          "en": "Website design & development"
        }
      },
      "booking_system_setup": {
        "amount": 25000,
        "label": {
          "fr": "Configuration du système de réservation",
          "en": "Booking system setup & customization"
        }
      },
      "payment_gateway_config": {
        "amount": 15000,
        "label": {
          "fr": "Configuration passerelle de paiement",
          "en": "Payment gateway configuration"
        }
      },
      "google_business_optimization": {
        "amount": 10000,
        "label": {
          "fr": "Optimisation Google Business",
          "en": "Google Business optimization"
        }
      },
      "domain_email_setup": {
        "amount": 5000,
        "label": {
          "fr": "Configuration domaine et email",
          "en": "Domain & email setup"
        }
      },
      "platform_listing_assistance": {
        "amount": 10000,
        "label": {
          "fr": "Assistance inscription plateformes",
          "en": "Platform listing assistance"
        }
      },
      "training_documentation": {
        "amount": 5000,
        "label": {
          "fr": "Formation et documentation",
          "en": "Training & documentation"
        }
      },
      "total": 250000
    },
    
    "monthly_costs": {
      "hosting_domain": {
        "amount": 1400,
        "label": {
          "fr": "Hébergement et Domaine",
          "en": "Hosting & Domain"
        }
      },
      "jotform_professional": {
        "amount": 4000,
        "label": {
          "fr": "JotForm Professional",
          "en": "JotForm Professional"
        }
      },
      "total": 5400
    },
    
    "addons_available": {
      "enhanced_design": {
        "price": 35000,
        "timeline_weeks": 1,
        "title": {
          "fr": "Package Design Amélioré",
          "en": "Enhanced Design Package"
        },
        "description": {
          "fr": "Logo personnalisé, retouche photo premium, matériaux de marque",
          "en": "Custom logo design, premium photo editing, branded materials"
        }
      },
      "english_version": {
        "price": 25000,
        "timeline_weeks": 1,
        "title": {
          "fr": "Version Anglaise",
          "en": "English Language Version"
        },
        "description": {
          "fr": "Traduction complète du site, formulaires anglais",
          "en": "Complete website translation, English booking forms"
        }
      },
      "social_media": {
        "price": 15000,
        "timeline_weeks": 0.5,
        "title": {
          "fr": "Configuration Réseaux Sociaux",
          "en": "Social Media Setup"
        },
        "description": {
          "fr": "Facebook Business, Instagram, modèles de contenu",
          "en": "Facebook Business page, Instagram setup, content templates"
        }
      },
      "advanced_seo": {
        "price": 30000,
        "timeline_weeks": 1,
        "title": {
          "fr": "SEO Avancé",
          "en": "Advanced SEO Optimization"
        },
        "description": {
          "fr": "Recherche mots-clés, optimisation Google",
          "en": "Keyword research, Google ranking optimization"
        }
      },
      "email_marketing": {
        "price": 20000,
        "timeline_weeks": 0.5,
        "title": {
          "fr": "Email Marketing",
          "en": "Email Marketing System"
        },
        "description": {
          "fr": "Emails automatisés, templates newsletter",
          "en": "Automated email sequences, newsletter templates"
        }
      },
      "analytics_dashboard": {
        "price": 25000,
        "timeline_weeks": 0.5,
        "title": {
          "fr": "Analytics Avancé",
          "en": "Advanced Analytics Dashboard"
        },
        "description": {
          "fr": "Rapports détaillés, insights client, suivi revenus",
          "en": "Detailed booking reports, customer insights, revenue tracking"
        }
      }
    },
    
    "selected_addons": [],
    
    "technical_specifications": {
      "domain_suggestions": [
        {
          "name": "lagoon-adventures.com",
          "available": true,
          "recommended": true,
          "notes": {
            "fr": "Option recommandée - clair et mémorable",
            "en": "Recommended option - clear and memorable"
          }
        },
        {
          "name": "tahiti-lagoon-tours.com",
          "available": true,
          "recommended": false,
          "notes": {
            "fr": "Alternative - focus géographique",
            "en": "Alternative - geographic focus"
          }
        },
        {
          "name": "manea-tours.com",
          "available": true,
          "recommended": false,
          "notes": {
            "fr": "Option avec nom personnel",
            "en": "Option with personal name"
          }
        }
      ],
      "hosting_provider": "Porkbun Cloud WordPress",
      "booking_system": "JotForm Professional",
      "payment_processor": "OSB PayZen",
      "cms": "WordPress",
      "languages_needed": ["French", "English"]
    },
    
    "timeline": {
      "total_weeks": 3,
      "week_1": {
        "title": {
          "fr": "Semaine 1: Fondation",
          "en": "Week 1: Foundation"
        },
        "tasks": [
          "Domain registration & hosting setup",
          "WordPress installation & basic configuration",
          "JotForm account creation & VAI Operator setup"
        ],
        "deliverables": [
          "Domain active",
          "Hosting configured", 
          "Basic site structure"
        ]
      },
      "week_2": {
        "title": {
          "fr": "Semaine 2: Développement",
          "en": "Week 2: Development"
        },
        "tasks": [
          "Website design implementation",
          "Booking system integration",
          "Google Business & platform preparation"
        ],
        "deliverables": [
          "Website design complete",
          "Booking forms functional",
          "Payment processing ready"
        ]
      },
      "week_3": {
        "title": {
          "fr": "Semaine 3: Lancement",
          "en": "Week 3: Launch & Optimization"
        },
        "tasks": [
          "Testing & refinement",
          "Platform listings creation",
          "Training & go-live"
        ],
        "deliverables": [
          "Live website",
          "Platform listings submitted",
          "Training completed"
        ]
      }
    },
    
    "roi_analysis": {
      "break_even": {
        "monthly_bookings_needed": 1,
        "booking_frequency": "every 2 weeks",
        "timeline_months": 3
      },
      "growth_projections": {
        "month_1_2": {
          "bookings_range": "2-4",
          "revenue_range_xpf": "24000-48000",
          "description": {
            "fr": "Installation et bouche-à-oreille",
            "en": "Setup and word-of-mouth"
          }
        },
        "month_3_4": {
          "bookings_range": "8-12",
          "revenue_range_xpf": "96000-144000",
          "description": {
            "fr": "Classement Google améliore",
            "en": "Google ranking improves"
          }
        },
        "month_6_plus": {
          "bookings_range": "15-25",
          "revenue_range_xpf": "180000-300000",
          "description": {
            "fr": "Présence en ligne établie",
            "en": "Established online presence"
          }
        }
      },
      "annual_savings_vs_traditional": 417200
    },
    
    "next_steps": {
      "immediate_actions": [
        {
          "task": "domain_choice",
          "completed": false,
          "notes": ""
        },
        {
          "task": "business_information_gathering",
          "completed": false,
          "notes": ""
        },
        {
          "task": "visual_content_preparation",
          "completed": false,
          "notes": ""
        },
        {
          "task": "payment_processing_setup",
          "completed": false,
          "notes": ""
        }
      ],
      "domain_preferences": {
        "primary_choice": "",
        "backup_options": [],
        "decision_date": null
      },
      "content_requirements": {
        "logo_available": false,
        "photos_ready": false,
        "business_registration_info": false,
        "bank_account_details": false
      },
      "training_preferences": {
        "format": "video_call",
        "duration_hours": 2,
        "preferred_language": "fr",
        "topics": [
          "website_management",
          "booking_processing", 
          "customer_communication"
        ]
      }
    },
    
    "communication_log": [],
    "documents": [],
    "milestones": [
      {
        "name": "proposal_accepted",
        "status": "pending",
        "date": null,
        "description": {
          "fr": "Proposition acceptée",
          "en": "Proposal Accepted"
        }
      },
      {
        "name": "domain_selected",
        "status": "pending", 
        "date": null,
        "description": {
          "fr": "Domaine sélectionné",
          "en": "Domain Selected"
        }
      },
      {
        "name": "content_gathered",
        "status": "pending",
        "date": null,
        "description": {
          "fr": "Contenu rassemblé",
          "en": "Content Gathered"
        }
      },
      {
        "name": "development_started",
        "status": "pending",
        "date": null,
        "description": {
          "fr": "Développement commencé",
          "en": "Development Started"
        }
      },
      {
        "name": "website_live",
        "status": "pending",
        "date": null,
        "description": {
          "fr": "Site web en ligne",
          "en": "Website Live"
        }
      },
      {
        "name": "training_completed",
        "status": "pending",
        "date": null,
        "description": {
          "fr": "Formation terminée",
          "en": "Training Completed"
        }
      }
    ]
  }',
  'Initial client from WhatsApp conversation - August 2025. Tourism business startup focusing on lagoon excursions in Tahiti. French-speaking client (Teva) prefers informal communication style.'
);

-- Grant necessary permissions
GRANT ALL ON public.vai_studio_clients TO authenticated;
GRANT SELECT ON public.vai_studio_clients TO anon;

-- Add comment for documentation
COMMENT ON TABLE public.vai_studio_clients IS 'VAI Studio client portal data - separate from VAI Operator system. Smart bilingual structure with comprehensive proposal data.';
COMMENT ON COLUMN public.vai_studio_clients.proposal_data IS 'Comprehensive JSON with smart bilingual approach: Kevin-controlled content (pricing, add-ons, timelines) translated, static explanations handled in templates.';
COMMENT ON COLUMN public.vai_studio_clients.slug IS 'URL-safe identifier for client portal (vai.studio/clients/{slug})';
COMMENT ON COLUMN public.vai_studio_clients.access_password IS 'Simple password protection for Phase 1 - migrate to auth_user_id for Phase 2';