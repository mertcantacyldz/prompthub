-- PromptHub Seed Data
-- Bu dosyayı Supabase SQL Editor'da çalıştırarak örnek data ekleyebilirsiniz.

-- NOT: Bu script'i çalıştırmadan önce:
-- 1. Supabase Auth'da manuel olarak birkaç kullanıcı oluşturun (veya aşağıdaki UUID'leri gerçek user ID'leriyle değiştirin)
-- 2. Veya profiles tablosuna direkt insert yapın (auth.users tetikleyicisi olmadan)

-- =====================================================
-- PROFILES (Örnek Kullanıcılar)
-- =====================================================
-- NOT: Gerçek kullanımda bu ID'ler Supabase Auth'dan gelmelidir
-- Demo amaçlı sabit UUID'ler kullanıyoruz

INSERT INTO profiles (id, email, username, display_name, bio, avatar_url, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'john@example.com', 'johndoe', 'John Doe', 'AI enthusiast and prompt engineer. I love creating prompts that help people be more productive.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'sarah@example.com', 'sarahcodes', 'Sarah Chen', 'Full-stack developer passionate about AI tools. Sharing my best prompts for coding.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', NOW() - INTERVAL '25 days'),
  ('33333333-3333-3333-3333-333333333333', 'mike@example.com', 'mikeai', 'Mike Wilson', 'Creative writer and AI artist. Midjourney and DALL-E are my playgrounds.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', NOW() - INTERVAL '20 days'),
  ('44444444-4444-4444-4444-444444444444', 'emma@example.com', 'emmawriter', 'Emma Johnson', 'Content strategist helping businesses leverage AI for better marketing.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', NOW() - INTERVAL '15 days'),
  ('55555555-5555-5555-5555-555555555555', 'alex@example.com', 'alexdev', 'Alex Turner', 'Software architect exploring the intersection of AI and software development.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PROMPTS (Örnek Promptlar)
-- =====================================================

INSERT INTO prompts (id, user_id, title, description, prompt_text, categories, ai_platforms, input_modality, is_public, view_count, copy_count, created_at) VALUES

-- Programming Prompts
('p0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
'Senior Code Reviewer',
'Get detailed, senior-level code reviews with best practices and optimization suggestions.',
'You are a senior software engineer with 15+ years of experience. Review the following code and provide:

1. **Code Quality Assessment** (1-10 scale)
2. **Potential Bugs & Issues**
3. **Performance Optimizations**
4. **Security Concerns**
5. **Best Practices Violations**
6. **Refactoring Suggestions**

Be specific and provide code examples for improvements. Format your response in clear sections.

Code to review:
[PASTE YOUR CODE HERE]',
ARRAY['Programming', 'Technology'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1250, 342, NOW() - INTERVAL '28 days'),

('p0000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
'React Component Generator',
'Generate production-ready React components with TypeScript and best practices.',
'Create a React component with the following specifications:

**Component Name:** [NAME]
**Purpose:** [DESCRIPTION]
**Props:** [LIST PROPS]

Requirements:
- Use TypeScript with proper type definitions
- Follow React best practices and hooks
- Include proper error handling
- Add JSDoc comments
- Make it accessible (ARIA attributes)
- Include basic unit test structure

Output format:
1. Component code
2. Types/interfaces
3. Example usage
4. Test file structure',
ARRAY['Programming', 'Technology'],
ARRAY['ChatGPT', 'Claude', 'Copilot'],
'text', true, 2100, 567, NOW() - INTERVAL '24 days'),

('p0000003-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555',
'SQL Query Optimizer',
'Optimize SQL queries for better performance with detailed explanations.',
'You are a database performance expert. Analyze and optimize the following SQL query:

```sql
[PASTE YOUR SQL QUERY HERE]
```

Provide:
1. **Performance Analysis** - Identify bottlenecks
2. **Optimized Query** - Rewritten for better performance
3. **Index Recommendations** - Suggested indexes
4. **Execution Plan Tips** - What to look for
5. **Alternative Approaches** - Different ways to achieve the same result

Database type: [PostgreSQL/MySQL/SQLite]
Table size estimate: [rows]',
ARRAY['Programming', 'Technology'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 890, 234, NOW() - INTERVAL '8 days'),

-- Image Generation Prompts
('p0000004-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
'Cinematic Portrait Generator',
'Create stunning cinematic portraits with dramatic lighting and mood.',
'Portrait of [SUBJECT DESCRIPTION], cinematic lighting, dramatic shadows, golden hour, shallow depth of field, shot on Arri Alexa, anamorphic lens flare, 8k resolution, hyperrealistic, award-winning photography, by Annie Leibovitz style

Negative: cartoon, anime, illustration, painting, drawing, bad anatomy, blurry, low quality, watermark',
ARRAY['Image Generation', 'Design'],
ARRAY['Midjourney', 'DALL-E', 'Stable Diffusion'],
'text', true, 3400, 1205, NOW() - INTERVAL '18 days'),

('p0000005-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333',
'Isometric Room Designer',
'Generate beautiful isometric room designs for games or illustrations.',
'Isometric view of a cozy [ROOM TYPE] room, soft ambient lighting, detailed furniture, plants, warm color palette, miniature diorama style, tilt-shift effect, highly detailed, cute aesthetic, Studio Ghibli inspired, 3D render, octane render, 4k

Style: [Modern/Vintage/Futuristic/Fantasy]
Mood: [Cozy/Professional/Playful/Elegant]',
ARRAY['Image Generation', 'Design'],
ARRAY['Midjourney', 'DALL-E'],
'text', true, 2800, 945, NOW() - INTERVAL '16 days'),

('p0000006-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333',
'Logo Concept Generator',
'Create modern, minimalist logo concepts for brands.',
'Minimalist logo design for [BRAND NAME], [INDUSTRY] company,

Style requirements:
- Clean geometric shapes
- Maximum 2-3 colors
- Scalable vector style
- Modern and timeless
- White background

Concept direction: [Abstract/Lettermark/Mascot/Emblem]
Brand personality: [Professional/Playful/Luxury/Tech]

Output as flat design, no gradients, suitable for all sizes',
ARRAY['Image Generation', 'Design', 'Business'],
ARRAY['Midjourney', 'DALL-E'],
'text', true, 1900, 623, NOW() - INTERVAL '14 days'),

-- Writing & Content Prompts
('p0000007-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444',
'Blog Post Outline Creator',
'Generate comprehensive blog post outlines with SEO optimization.',
'Create a detailed blog post outline for the topic: "[TOPIC]"

Target audience: [AUDIENCE]
Target word count: [WORD COUNT]
Primary keyword: [KEYWORD]

Include:
1. **Compelling Title Options** (3 variations)
2. **Meta Description** (155 characters)
3. **Introduction Hook**
4. **Main Sections** (H2 headings with H3 subpoints)
5. **Key Statistics/Data Points to Include**
6. **Internal/External Linking Opportunities**
7. **Call-to-Action Ideas**
8. **FAQ Section** (5 questions)

Make it SEO-friendly while maintaining reader engagement.',
ARRAY['Writing/Content', 'Marketing', 'SEO'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1650, 478, NOW() - INTERVAL '12 days'),

('p0000008-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444',
'Email Sequence Writer',
'Create converting email marketing sequences for various purposes.',
'Write a [NUMBER]-email sequence for [PURPOSE].

Business: [BUSINESS TYPE]
Target audience: [AUDIENCE]
Goal: [CONVERSION GOAL]
Tone: [Professional/Casual/Friendly/Urgent]

For each email provide:
1. Subject line (+ 2 A/B test variations)
2. Preview text
3. Email body with clear structure
4. CTA button text
5. Optimal send timing

Include psychological triggers and persuasion techniques. Make emails mobile-friendly (short paragraphs).',
ARRAY['Writing/Content', 'Marketing', 'Business'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1420, 389, NOW() - INTERVAL '11 days'),

('p0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111',
'Product Description Writer',
'Generate compelling e-commerce product descriptions that sell.',
'Write a compelling product description for:

Product: [PRODUCT NAME]
Category: [CATEGORY]
Key features: [LIST FEATURES]
Target customer: [CUSTOMER PROFILE]
Price point: [BUDGET/MID-RANGE/PREMIUM]

Include:
1. **Attention-grabbing headline**
2. **Emotional hook** (first 2 sentences)
3. **Feature-benefit bullets** (5-7 points)
4. **Social proof placeholder**
5. **Urgency/scarcity element**
6. **Clear CTA**

Tone: [Luxury/Casual/Technical/Playful]
Length: ~150-200 words',
ARRAY['Writing/Content', 'Marketing', 'Business'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 980, 267, NOW() - INTERVAL '26 days'),

-- Education Prompts
('p0000010-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222',
'Concept Explainer (ELI5)',
'Explain complex concepts in simple terms anyone can understand.',
'Explain [CONCEPT] as if I''m a curious 10-year-old.

Requirements:
1. Use simple, everyday words
2. Include a relatable analogy or metaphor
3. Give a real-world example
4. Break it into 3-4 easy steps if it''s a process
5. End with a "fun fact" related to the topic

Avoid: jargon, technical terms, assuming prior knowledge

Format:
🎯 Simple explanation
🌟 Analogy
📝 Example
🎉 Fun fact',
ARRAY['Education', 'Science', 'Technology'],
ARRAY['ChatGPT', 'Claude', 'Gemini'],
'text', true, 2300, 612, NOW() - INTERVAL '22 days'),

('p0000011-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222',
'Flashcard Generator',
'Create effective flashcards for any subject with spaced repetition in mind.',
'Create 15 flashcards for studying [TOPIC].

Subject area: [SUBJECT]
Difficulty level: [Beginner/Intermediate/Advanced]
Learning goal: [GOAL]

Format each flashcard as:
---
**Card [N]**
**Front:** [Question/Term/Prompt]
**Back:** [Answer/Definition/Explanation]
**Mnemonic:** [Memory aid if applicable]
**Related:** [Connected concept]
---

Include a mix of:
- Definition cards (30%)
- Application cards (40%)
- Connection cards (30%)

Make answers concise but complete.',
ARRAY['Education', 'Academia'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1100, 298, NOW() - INTERVAL '20 days'),

-- Business & Productivity
('p0000012-0000-0000-0000-000000000012', '55555555-5555-5555-5555-555555555555',
'Meeting Notes to Action Items',
'Convert messy meeting notes into organized action items and summaries.',
'Transform these meeting notes into a structured summary:

[PASTE MEETING NOTES HERE]

Output format:

## 📋 Meeting Summary
- Date: [extracted or today]
- Attendees: [extracted names]
- Duration: [if mentioned]

## 🎯 Key Decisions
1. [Decision 1]
2. [Decision 2]

## ✅ Action Items
| Task | Owner | Deadline | Priority |
|------|-------|----------|----------|
| [Task] | [Name] | [Date] | [H/M/L] |

## 📌 Discussion Points
- [Main topic 1]
- [Main topic 2]

## ❓ Open Questions
- [Question needing follow-up]

## 📅 Next Steps
- [What happens next]',
ARRAY['Business', 'Technology'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1800, 521, NOW() - INTERVAL '7 days'),

('p0000013-0000-0000-0000-000000000013', '44444444-4444-4444-4444-444444444444',
'SWOT Analysis Generator',
'Generate comprehensive SWOT analyses for business planning.',
'Conduct a detailed SWOT analysis for:

Company/Project: [NAME]
Industry: [INDUSTRY]
Context: [BRIEF DESCRIPTION]

## Strengths (Internal Positive)
- [List 5-7 strengths with brief explanations]

## Weaknesses (Internal Negative)
- [List 5-7 weaknesses with brief explanations]

## Opportunities (External Positive)
- [List 5-7 opportunities with market context]

## Threats (External Negative)
- [List 5-7 threats with risk assessment]

## Strategic Recommendations
Based on the analysis:
1. **Leverage:** How to use strengths to capture opportunities
2. **Improve:** How to address weaknesses
3. **Monitor:** Key threats to watch
4. **Quick Wins:** Immediate actions to consider',
ARRAY['Business', 'Marketing'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 750, 198, NOW() - INTERVAL '13 days'),

-- Fun & Creative
('p0000014-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111',
'Story Plot Generator',
'Generate unique and engaging story plot ideas with detailed outlines.',
'Generate a compelling story plot:

Genre: [GENRE]
Setting: [TIME PERIOD & LOCATION]
Tone: [Dark/Light/Humorous/Dramatic]
Length target: [Short story/Novella/Novel]

Provide:

## 🎭 Premise
[One compelling sentence]

## 👥 Main Characters
1. **Protagonist:** [Name, brief description, motivation]
2. **Antagonist:** [Name, brief description, goal]
3. **Supporting:** [2-3 key characters]

## 📖 Plot Structure
- **Hook:** [Opening scene]
- **Inciting Incident:** [What changes everything]
- **Rising Action:** [3 key events]
- **Climax:** [The big confrontation]
- **Resolution:** [How it ends]

## 🔥 Conflict
- External: [Main external conflict]
- Internal: [Character''s inner struggle]

## 💡 Unique Twist
[What makes this story different]',
ARRAY['Fun/Creative', 'Writing/Content'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1350, 367, NOW() - INTERVAL '25 days'),

('p0000015-0000-0000-0000-000000000015', '33333333-3333-3333-3333-333333333333',
'D&D Character Creator',
'Create detailed D&D characters with rich backstories and unique traits.',
'Create a D&D 5e character:

Race: [RACE or "surprise me"]
Class: [CLASS or "surprise me"]
Background: [BACKGROUND or "surprise me"]
Level: [LEVEL]

Generate:

## 📜 Basic Info
- **Name:** [Thematic name]
- **Race/Class:** [Details]
- **Alignment:** [With justification]
- **Age/Appearance:** [Description]

## 📊 Suggested Stats (Point Buy)
STR: [ ] DEX: [ ] CON: [ ]
INT: [ ] WIS: [ ] CHA: [ ]

## 🎭 Personality
- **Trait 1:** [Personality trait]
- **Trait 2:** [Personality trait]
- **Ideal:** [What they believe]
- **Bond:** [What they protect]
- **Flaw:** [Their weakness]

## 📖 Backstory
[2-3 paragraph compelling backstory with plot hooks]

## 🗣️ Voice & Mannerisms
- Speaking style: [How they talk]
- Catchphrase: [Signature saying]
- Quirk: [Unique behavior]

## 🎯 Goals
- Short-term: [Immediate goal]
- Long-term: [Life ambition]
- Secret: [Hidden desire]',
ARRAY['Fun/Creative', 'Roleplay'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 2100, 589, NOW() - INTERVAL '17 days'),

-- Life Coach & Productivity
('p0000016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111',
'Goal Setting Framework',
'Create SMART goals with actionable plans and accountability measures.',
'Help me create a comprehensive goal plan:

Goal area: [Career/Health/Finance/Relationship/Personal Growth]
Desired outcome: [WHAT YOU WANT TO ACHIEVE]
Timeline: [TIMEFRAME]
Current situation: [WHERE YOU ARE NOW]

Create:

## 🎯 SMART Goal Statement
[Specific, Measurable, Achievable, Relevant, Time-bound]

## 📊 Success Metrics
- Lead indicator: [What to track weekly]
- Lag indicator: [Final success measure]

## 🗺️ Milestone Breakdown
| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| [M1] | [Date] | [How to know it''s done] |

## 📅 Weekly Action Plan
- Monday: [Action]
- Tuesday: [Action]
- ... [Continue]

## 🚧 Obstacle Anticipation
| Potential Obstacle | Prevention Strategy | Response Plan |
|-------------------|---------------------|---------------|

## 🏆 Reward System
- Mini milestone reward: [Small celebration]
- Major milestone reward: [Bigger reward]
- Goal completion reward: [Ultimate reward]

## 📱 Accountability
- Check-in schedule: [When/how often]
- Accountability partner: [Who/how]',
ARRAY['Life Coach', 'Business'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1560, 423, NOW() - INTERVAL '27 days'),

-- Translation
('p0000017-0000-0000-0000-000000000017', '55555555-5555-5555-5555-555555555555',
'Context-Aware Translator',
'Translate text while preserving context, tone, and cultural nuances.',
'Translate the following text:

**Source Language:** [LANGUAGE]
**Target Language:** [LANGUAGE]
**Context:** [Business/Casual/Literary/Technical]
**Tone:** [Formal/Informal/Friendly]
**Target Audience:** [Who will read this]

Text to translate:
"""
[YOUR TEXT HERE]
"""

Provide:

## 📝 Translation
[Main translation]

## 🔄 Alternative Phrasings
[2-3 alternative ways to express key phrases]

## 📚 Cultural Notes
[Any cultural adaptations made and why]

## ⚠️ Untranslatable Elements
[Words/concepts that don''t translate directly]

## 💡 Localization Suggestions
[Recommendations for cultural adaptation]',
ARRAY['Translation', 'Business'],
ARRAY['ChatGPT', 'Claude', 'Gemini'],
'text', true, 670, 178, NOW() - INTERVAL '9 days'),

-- SEO
('p0000018-0000-0000-0000-000000000018', '44444444-4444-4444-4444-444444444444',
'SEO Content Optimizer',
'Optimize existing content for search engines while maintaining readability.',
'Optimize this content for SEO:

**Target Keyword:** [PRIMARY KEYWORD]
**Secondary Keywords:** [LIST 3-5]
**Current Content:**
"""
[PASTE CONTENT HERE]
"""

Provide:

## 📊 Current SEO Score Assessment
- Keyword density: [Current %]
- Readability: [Grade level]
- Issues found: [List]

## ✨ Optimized Version
[Rewritten content with natural keyword integration]

## 📋 Optimization Checklist
- [ ] Title tag suggestion (60 chars)
- [ ] Meta description (155 chars)
- [ ] H1 recommendation
- [ ] H2 subheadings (3-5)
- [ ] Image alt text suggestions
- [ ] Internal linking opportunities
- [ ] Schema markup recommendation

## 🔗 Keyword Placement Map
- Title: [Yes/No]
- First 100 words: [Yes/No]
- Subheadings: [Count]
- Body: [Density %]
- Conclusion: [Yes/No]',
ARRAY['SEO', 'Marketing', 'Writing/Content'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1230, 334, NOW() - INTERVAL '6 days'),

-- Health & Wellness
('p0000019-0000-0000-0000-000000000019', '22222222-2222-2222-2222-222222222222',
'Meal Plan Generator',
'Create personalized weekly meal plans based on dietary preferences and goals.',
'Create a 7-day meal plan:

**Dietary preference:** [Omnivore/Vegetarian/Vegan/Keto/etc.]
**Calorie target:** [CALORIES/day]
**Allergies/Restrictions:** [LIST]
**Cooking skill:** [Beginner/Intermediate/Advanced]
**Prep time available:** [Minutes per meal]
**Budget:** [Low/Medium/High]
**Goal:** [Weight loss/Muscle gain/Maintenance/Energy]

Generate:

## 📅 Weekly Overview
| Day | Breakfast | Lunch | Dinner | Snacks |
|-----|-----------|-------|--------|--------|

## 🛒 Shopping List
**Produce:**
**Proteins:**
**Dairy:**
**Pantry:**

## 📊 Daily Nutrition (Average)
- Calories: [X]
- Protein: [X]g
- Carbs: [X]g
- Fat: [X]g
- Fiber: [X]g

## 👨‍🍳 Meal Prep Tips
[Time-saving preparation strategies]

## 🔄 Swap Options
[Alternative ingredients for variety]',
ARRAY['Health', 'Life Coach'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 1890, 512, NOW() - INTERVAL '5 days'),

-- Finance
('p0000020-0000-0000-0000-000000000020', '55555555-5555-5555-5555-555555555555',
'Budget Analysis Assistant',
'Analyze spending patterns and create actionable budget recommendations.',
'Analyze my monthly finances:

**Monthly Income:** $[AMOUNT]
**Fixed Expenses:**
- Rent/Mortgage: $[X]
- Utilities: $[X]
- Insurance: $[X]
- [Add more]

**Variable Expenses (last month):**
- Groceries: $[X]
- Dining out: $[X]
- Entertainment: $[X]
- Shopping: $[X]
- Transportation: $[X]
- [Add more]

**Financial Goals:**
1. [Goal 1]
2. [Goal 2]

Provide:

## 📊 Spending Analysis
- Total expenses: $[X]
- Savings rate: [X]%
- Expense breakdown by category [percentages]

## ⚠️ Red Flags
[Areas of overspending]

## 💡 Recommendations
1. [Specific actionable tip]
2. [Specific actionable tip]

## 📈 Optimized Budget
| Category | Current | Recommended | Savings |
|----------|---------|-------------|---------|

## 🎯 Savings Potential
- Monthly: $[X]
- Yearly: $[X]

## 🏦 Emergency Fund Status
[Assessment and timeline to 3-6 months]',
ARRAY['Finance', 'Life Coach'],
ARRAY['ChatGPT', 'Claude'],
'text', true, 980, 267, NOW() - INTERVAL '4 days')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PROMPT RATINGS (Materialized View Update)
-- =====================================================
-- Rating'ler prompt_ratings view'ı üzerinden hesaplanır
-- Manuel rating eklemek için:

INSERT INTO ratings (id, user_id, prompt_id, score, created_at) VALUES
-- Ratings for "Senior Code Reviewer"
('r0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'p0000001-0000-0000-0000-000000000001', 5, NOW() - INTERVAL '27 days'),
('r0000002-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'p0000001-0000-0000-0000-000000000001', 5, NOW() - INTERVAL '26 days'),
('r0000003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'p0000001-0000-0000-0000-000000000001', 4, NOW() - INTERVAL '25 days'),
('r0000004-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'p0000001-0000-0000-0000-000000000001', 5, NOW() - INTERVAL '20 days'),

-- Ratings for "React Component Generator"
('r0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'p0000002-0000-0000-0000-000000000002', 5, NOW() - INTERVAL '23 days'),
('r0000006-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'p0000002-0000-0000-0000-000000000002', 4, NOW() - INTERVAL '22 days'),
('r0000007-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', 'p0000002-0000-0000-0000-000000000002', 5, NOW() - INTERVAL '21 days'),
('r0000008-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555555', 'p0000002-0000-0000-0000-000000000002', 5, NOW() - INTERVAL '18 days'),

-- Ratings for "Cinematic Portrait Generator"
('r0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'p0000004-0000-0000-0000-000000000004', 5, NOW() - INTERVAL '17 days'),
('r0000010-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222', 'p0000004-0000-0000-0000-000000000004', 5, NOW() - INTERVAL '16 days'),
('r0000011-0000-0000-0000-000000000011', '44444444-4444-4444-4444-444444444444', 'p0000004-0000-0000-0000-000000000004', 4, NOW() - INTERVAL '15 days'),
('r0000012-0000-0000-0000-000000000012', '55555555-5555-5555-5555-555555555555', 'p0000004-0000-0000-0000-000000000004', 5, NOW() - INTERVAL '14 days'),

-- Ratings for "Isometric Room Designer"
('r0000013-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'p0000005-0000-0000-0000-000000000005', 5, NOW() - INTERVAL '15 days'),
('r0000014-0000-0000-0000-000000000014', '22222222-2222-2222-2222-222222222222', 'p0000005-0000-0000-0000-000000000005', 4, NOW() - INTERVAL '14 days'),
('r0000015-0000-0000-0000-000000000015', '44444444-4444-4444-4444-444444444444', 'p0000005-0000-0000-0000-000000000005', 5, NOW() - INTERVAL '13 days'),

-- Ratings for "Blog Post Outline Creator"
('r0000016-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'p0000007-0000-0000-0000-000000000007', 4, NOW() - INTERVAL '11 days'),
('r0000017-0000-0000-0000-000000000017', '22222222-2222-2222-2222-222222222222', 'p0000007-0000-0000-0000-000000000007', 5, NOW() - INTERVAL '10 days'),
('r0000018-0000-0000-0000-000000000018', '33333333-3333-3333-3333-333333333333', 'p0000007-0000-0000-0000-000000000007', 4, NOW() - INTERVAL '9 days'),

-- Ratings for "Concept Explainer"
('r0000019-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111111', 'p0000010-0000-0000-0000-000000000010', 5, NOW() - INTERVAL '21 days'),
('r0000020-0000-0000-0000-000000000020', '33333333-3333-3333-3333-333333333333', 'p0000010-0000-0000-0000-000000000010', 5, NOW() - INTERVAL '20 days'),
('r0000021-0000-0000-0000-000000000021', '44444444-4444-4444-4444-444444444444', 'p0000010-0000-0000-0000-000000000010', 4, NOW() - INTERVAL '19 days'),
('r0000022-0000-0000-0000-000000000022', '55555555-5555-5555-5555-555555555555', 'p0000010-0000-0000-0000-000000000010', 5, NOW() - INTERVAL '18 days'),

-- Ratings for "D&D Character Creator"
('r0000023-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', 'p0000015-0000-0000-0000-000000000015', 5, NOW() - INTERVAL '16 days'),
('r0000024-0000-0000-0000-000000000024', '22222222-2222-2222-2222-222222222222', 'p0000015-0000-0000-0000-000000000015', 5, NOW() - INTERVAL '15 days'),
('r0000025-0000-0000-0000-000000000025', '44444444-4444-4444-4444-444444444444', 'p0000015-0000-0000-0000-000000000015', 4, NOW() - INTERVAL '14 days'),
('r0000026-0000-0000-0000-000000000026', '55555555-5555-5555-5555-555555555555', 'p0000015-0000-0000-0000-000000000015', 5, NOW() - INTERVAL '13 days'),

-- Ratings for "Meal Plan Generator"
('r0000027-0000-0000-0000-000000000027', '11111111-1111-1111-1111-111111111111', 'p0000019-0000-0000-0000-000000000019', 5, NOW() - INTERVAL '4 days'),
('r0000028-0000-0000-0000-000000000028', '33333333-3333-3333-3333-333333333333', 'p0000019-0000-0000-0000-000000000019', 4, NOW() - INTERVAL '3 days'),
('r0000029-0000-0000-0000-000000000029', '44444444-4444-4444-4444-444444444444', 'p0000019-0000-0000-0000-000000000019', 5, NOW() - INTERVAL '2 days'),

-- More varied ratings for other prompts
('r0000030-0000-0000-0000-000000000030', '11111111-1111-1111-1111-111111111111', 'p0000003-0000-0000-0000-000000000003', 4, NOW() - INTERVAL '7 days'),
('r0000031-0000-0000-0000-000000000031', '22222222-2222-2222-2222-222222222222', 'p0000003-0000-0000-0000-000000000003', 5, NOW() - INTERVAL '6 days'),
('r0000032-0000-0000-0000-000000000032', '33333333-3333-3333-3333-333333333333', 'p0000006-0000-0000-0000-000000000006', 4, NOW() - INTERVAL '13 days'),
('r0000033-0000-0000-0000-000000000033', '55555555-5555-5555-5555-555555555555', 'p0000006-0000-0000-0000-000000000006', 5, NOW() - INTERVAL '12 days'),
('r0000034-0000-0000-0000-000000000034', '11111111-1111-1111-1111-111111111111', 'p0000012-0000-0000-0000-000000000012', 5, NOW() - INTERVAL '6 days'),
('r0000035-0000-0000-0000-000000000035', '22222222-2222-2222-2222-222222222222', 'p0000012-0000-0000-0000-000000000012', 4, NOW() - INTERVAL '5 days')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SAVED PROMPTS
-- =====================================================

INSERT INTO saved_prompts (id, user_id, prompt_id, created_at) VALUES
-- John's saved prompts
('s0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'p0000002-0000-0000-0000-000000000002', NOW() - INTERVAL '20 days'),
('s0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'p0000004-0000-0000-0000-000000000004', NOW() - INTERVAL '15 days'),
('s0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'p0000010-0000-0000-0000-000000000010', NOW() - INTERVAL '10 days'),

-- Sarah's saved prompts
('s0000004-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'p0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '25 days'),
('s0000005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'p0000007-0000-0000-0000-000000000007', NOW() - INTERVAL '12 days'),
('s0000006-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'p0000015-0000-0000-0000-000000000015', NOW() - INTERVAL '8 days'),

-- Mike's saved prompts
('s0000007-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', 'p0000001-0000-0000-0000-000000000001', NOW() - INTERVAL '22 days'),
('s0000008-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333', 'p0000002-0000-0000-0000-000000000002', NOW() - INTERVAL '18 days'),
('s0000009-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333333', 'p0000016-0000-0000-0000-000000000016', NOW() - INTERVAL '5 days'),

-- Emma's saved prompts
('s0000010-0000-0000-0000-000000000010', '44444444-4444-4444-4444-444444444444', 'p0000004-0000-0000-0000-000000000004', NOW() - INTERVAL '14 days'),
('s0000011-0000-0000-0000-000000000011', '44444444-4444-4444-4444-444444444444', 'p0000005-0000-0000-0000-000000000005', NOW() - INTERVAL '12 days'),
('s0000012-0000-0000-0000-000000000012', '44444444-4444-4444-4444-444444444444', 'p0000010-0000-0000-0000-000000000010', NOW() - INTERVAL '10 days'),
('s0000013-0000-0000-0000-000000000013', '44444444-4444-4444-4444-444444444444', 'p0000019-0000-0000-0000-000000000019', NOW() - INTERVAL '3 days'),

-- Alex's saved prompts
('s0000014-0000-0000-0000-000000000014', '55555555-5555-5555-5555-555555555555', 'p0000002-0000-0000-0000-000000000002', NOW() - INTERVAL '16 days'),
('s0000015-0000-0000-0000-000000000015', '55555555-5555-5555-5555-555555555555', 'p0000007-0000-0000-0000-000000000007', NOW() - INTERVAL '11 days'),
('s0000016-0000-0000-0000-000000000016', '55555555-5555-5555-5555-555555555555', 'p0000015-0000-0000-0000-000000000015', NOW() - INTERVAL '6 days')

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- REFRESH MATERIALIZED VIEW (if exists)
-- =====================================================
-- Eğer prompt_ratings bir materialized view ise:
-- REFRESH MATERIALIZED VIEW prompt_ratings;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Bu sorguları çalıştırarak verilerin doğru eklendiğini kontrol edebilirsiniz:

-- SELECT COUNT(*) as profile_count FROM profiles;
-- SELECT COUNT(*) as prompt_count FROM prompts;
-- SELECT COUNT(*) as rating_count FROM ratings;
-- SELECT COUNT(*) as saved_count FROM saved_prompts;

-- Prompts with ratings:
-- SELECT p.title, pr.average_rating, pr.rating_count
-- FROM prompts p
-- LEFT JOIN prompt_ratings pr ON p.id = pr.prompt_id
-- ORDER BY pr.average_rating DESC NULLS LAST;
