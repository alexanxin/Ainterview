-- Run this in Supabase SQL Editor to set up the new invitation codes system

-- Create the new invitation codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  description TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_status ON invitation_codes(status);

-- RLS (Row Level Security)
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access for validation
CREATE POLICY "Public can validate invitation codes" ON invitation_codes
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Allow authenticated users to manage codes
CREATE POLICY "Authenticated users can manage invitation codes" ON invitation_codes
  FOR ALL TO authenticated
  USING (true);

-- Generate simple codes like ABCD1234
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use codes
CREATE OR REPLACE FUNCTION use_invitation_code(code_param TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  error_message TEXT,
  code_info JSON
) AS $$
DECLARE
  code_record invitation_codes;
BEGIN
  -- Find the code
  SELECT * INTO code_record
  FROM invitation_codes
  WHERE UPPER(code) = UPPER(code_param)
  AND status = 'active';

  -- Check if code exists
  IF code_record IS NULL THEN
    RETURN QUERY SELECT false, 'Invalid invitation code', null;
    RETURN;
  END IF;

  -- Check if code is expired
  IF NOW() > code_record.expires_at THEN
    UPDATE invitation_codes SET status = 'expired' WHERE id = code_record.id;
    RETURN QUERY SELECT false, 'Invitation code has expired', null;
    RETURN;
  END IF;

  -- Check if code has been used enough times
  IF code_record.usage_count >= code_record.max_uses THEN
    UPDATE invitation_codes SET status = 'used' WHERE id = code_record.id;
    RETURN QUERY SELECT false, 'Invitation code has been fully used', null;
    RETURN;
  END IF;

  -- Code is valid - increment usage count
  UPDATE invitation_codes 
  SET 
    usage_count = usage_count + 1,
    used_at = COALESCE(used_at, NOW()),
    status = CASE 
      WHEN usage_count + 1 >= max_uses THEN 'used'
      ELSE 'active'
    END
  WHERE id = code_record.id;

  -- Return success with code info
  RETURN QUERY SELECT 
    true, 
    null, 
    json_build_object(
      'code', code_record.code,
      'usage_count', code_record.usage_count + 1,
      'max_uses', code_record.max_uses,
      'expires_at', code_record.expires_at
    );
END;
$$ LANGUAGE plpgsql;