export type ExpenseCategory =
    | 'housing' | 'food' | 'transport' | 'utilities' | 'medical'
    | 'education' | 'entertainment' | 'diningOut' | 'shopping'
    | 'subscriptions' | 'impulse' | 'other';

export type ExpenseType = 'necessary' | 'unnecessary';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
  isRecurring: boolean;
}

export interface IncomeStream {
  id: string;
  label: string;
  amount: number;
}

export interface FinancialProfile {
  monthlyIncome: number;
  currency: string;
  incomeStreams?: IncomeStream[];
}

export interface CategoryMeta {
  label: string;
  type: ExpenseType;
  color: string;
  icon: string;
}

export interface SpendingInsight {
  score: number;
  level: 'critical' | 'poor' | 'fair' | 'good' | 'excellent';
  message: string;
}

export interface InvestmentAdvice {
  emergencyFund: number;
  savings: number;
  investment: number;
  living: number;
  tips: string[];
}

export interface MonthlyBreakdown {
  totalExpenses: number;
  necessaryTotal: number;
  unnecessaryTotal: number;
  byCategory: Record<ExpenseCategory, number>;
  savingsLeft: number;
}

export type AppView =
    | 'dashboard' | 'expenses' | 'insights' | 'advisor'
    | 'investments' | 'goals' | 'bills' | 'networth' | 'chat'
    | 'emergency' | 'alerts' | 'upgrade' | 'profile';

// ─── Investment types ──────────────────────────────────────

export type InvestmentCategory =
    | 'sacco' | 'mmf' | 'stocks' | 'bonds' | 'realEstate'
    | 'crypto' | 'pension' | 'savingsAccount' | 'fixedDeposit' | 'other';

export type InvestmentStatus = 'active' | 'matured' | 'withdrawn';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  category: InvestmentCategory;
  date: string;
  expectedReturnPct: number;
  notes: string;
  status: InvestmentStatus;
  isRecurring: boolean;
}

export interface InvestmentCategoryMeta {
  label: string;
  color: string;
  icon: string;
  avgReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalMonthly: number;
  projectedAnnualReturn: number;
  byCategory: Record<InvestmentCategory, number>;
  activeCount: number;
}

// ─── Goals ────────────────────────────────────────────────

export type GoalCategory =
    | 'emergency' | 'vacation' | 'education' | 'property'
    | 'car' | 'business' | 'retirement' | 'wedding' | 'other';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  category: GoalCategory;
  deadline: string; // YYYY-MM
  monthlyContribution: number;
  notes: string;
  createdAt: string;
  completed: boolean;
}

export interface GoalCategoryMeta {
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ─── Bills ────────────────────────────────────────────────

export type BillCategory =
    | 'rent' | 'electricity' | 'water' | 'internet' | 'phone'
    | 'insurance' | 'subscription' | 'loan' | 'tv' | 'other';

export type BillFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type BillStatus = 'upcoming' | 'paid' | 'overdue';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: BillCategory;
  dueDay: number;
  frequency: BillFrequency;
  status: BillStatus;
  lastPaidDate?: string;
  notes: string;
  isRecurring: boolean;
}

export interface BillCategoryMeta {
  label: string;
  icon: string;
  color: string;
}

// ─── Net Worth ────────────────────────────────────────────

export type AssetCategory =
    | 'cash' | 'investments' | 'property' | 'vehicle'
    | 'crypto' | 'pension' | 'business' | 'other';

export type LiabilityCategory =
    | 'mortgage' | 'carLoan' | 'personalLoan'
    | 'creditCard' | 'studentLoan' | 'other';

export interface NetWorthItem {
  id: string;
  name: string;
  amount: number;
  category: AssetCategory | LiabilityCategory;
  type: 'asset' | 'liability';
  notes: string;
}

export interface AssetCategoryMeta {
  label: string;
  icon: string;
  color: string;
}

export interface LiabilityCategoryMeta {
  label: string;
  icon: string;
  color: string;
}

// ─── Auth ─────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'silver' | 'gold' | 'platinum';

export interface UserProfile {
  uid?: string;
  name: string;
  phone: string;
  pin: string;
  createdAt: string;
  tier: SubscriptionTier;
  blacklisted?: boolean;
  subscriptionStatus?: 'active' | 'pending_payment' | 'expired';
  pendingTier?: SubscriptionTier | null;
  previousTier?: SubscriptionTier;
  subscriptionExpiredAt?: string;
  subscriptionExpiresAt?: string;
  subscriptionStart?: string; // ISO date when paid tier began
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // KES/month, 0 = free
  color: string;
  icon: string;
  features: string[];
  lockedViews: AppView[];
}

// ─── Chat ─────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Habits ───────────────────────────────────────────────

export interface Habit {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  /** ISO date string of last completion reset */
  lastResetDate?: string;
}

// ─── Emergency Fund ───────────────────────────────────────

export interface EmergencyFundData {
  currentAmount: number;
  targetMonths: number;
  lastUpdated: string;
  contributions: { id: string; amount: number; date: string; note: string }[];
}

// ─── Admin ────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'support' | 'finance';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: string;
}

// ─── Alerts & SOS ─────────────────────────────────────────

export interface AlertContact {
  name: string;
  email: string;
  whatsapp: string;
  phone: string;
}

export interface AlertLog {
  id: string;
  channel: 'email' | 'whatsapp' | 'phone';
  timestamp: string;
  snapshot: string; // serialized financial summary at time of alert
}
