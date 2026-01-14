
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  app_id TEXT NOT NULL, -- e.g., 'Cityscope', 'ZenSynth'
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL -- polymorphic data for different app types
);

-- Enable RLS
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own data (optional, depends on use case)
CREATE POLICY "Users can view their own history" 
ON history FOR SELECT 
USING (true); -- Set to (auth.uid() = user_id) for private history

-- Create policy for public/anonymous insertion (if not using auth yet)
CREATE POLICY "Anyone can insert history" 
ON history FOR INSERT 
WITH CHECK (true);

-- Index for performance
CREATE INDEX idx_history_app_id ON history(app_id);
