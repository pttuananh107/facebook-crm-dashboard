CREATE TABLE page_filter_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL UNIQUE,
  page_name TEXT,

  -- Keyword scoring
  hot_keywords TEXT[] DEFAULT ARRAY['giá', 'bao nhiêu', 'mua', 'đặt hàng', 'báo giá', 'chi phí', 'order'],
  warm_keywords TEXT[] DEFAULT ARRAY['thông tin', 'tư vấn', 'hỏi', 'như thế nào', 'hợp tác'],
  cold_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Thời gian phản hồi (phút) để tính điểm
  response_time_hot INTEGER DEFAULT 30,
  response_time_warm INTEGER DEFAULT 120,

  -- Nguồn tin nhắn ảnh hưởng score
  boost_ads_score BOOLEAN DEFAULT false,
  boost_organic_score BOOLEAN DEFAULT false,

  -- Số tin nhắn tối thiểu để xét Hot/Warm
  min_messages_hot INTEGER DEFAULT 1,
  min_messages_warm INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: chỉ super_admin và admin mới được sửa
ALTER TABLE page_filter_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON page_filter_configs FOR SELECT USING (true);

CREATE POLICY "write_admin" ON page_filter_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );
