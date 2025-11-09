import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  verificationLevel: integer("verification_level").notNull().default(0),
  trustScore: integer("trust_score").default(50),
  isActive: boolean("is_active").notNull().default(true),
  lastActivityAt: timestamp("last_activity_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  documentType: text("document_type").notNull(),
  status: text("status").notNull().default("pending"),
  riskScore: integer("risk_score"),
  documentData: jsonb("document_data"),
  biometricData: jsonb("biometric_data"),
  flaggedReasons: text("flagged_reasons").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => verifications.id),
  documentUrl: text("document_url").notNull(),
  selfieUrl: text("selfie_url"),
  documentNumber: text("document_number"),
  expiryDate: timestamp("expiry_date"),
  extractedData: jsonb("extracted_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => verifications.id),
  action: text("action").notNull(),
  performedBy: varchar("performed_by").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const verificationSessions = pgTable("verification_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationId: varchar("verification_id").notNull().references(() => verifications.id),
  sessionType: text("session_type").notNull(),
  currentStep: integer("current_step").notNull().default(0),
  totalSteps: integer("total_steps").notNull(),
  status: text("status").notNull().default("in_progress"),
  documentUploaded: boolean("document_uploaded").default(false),
  selfieCaptured: boolean("selfie_captured").default(false),
  biometricsCompleted: boolean("biometrics_completed").default(false),
  riskAssessmentCompleted: boolean("risk_assessment_completed").default(false),
  sessionData: jsonb("session_data"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
});

export const biometricRecords = pgTable("biometric_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationId: varchar("verification_id").references(() => verifications.id),
  verificationSessionId: varchar("verification_session_id").references(() => verificationSessions.id),
  biometricType: text("biometric_type").notNull(),
  dataHash: text("data_hash").notNull(),
  embeddings: jsonb("embeddings"),
  livenessScore: real("liveness_score"),
  qualityScore: real("quality_score"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const behavioralBiometrics = pgTable("behavioral_biometrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationId: varchar("verification_id").references(() => verifications.id),
  verificationSessionId: varchar("verification_session_id").references(() => verificationSessions.id),
  sessionId: varchar("session_id").notNull(),
  typingPatterns: jsonb("typing_patterns"),
  mouseMovements: jsonb("mouse_movements"),
  deviceHandling: jsonb("device_handling"),
  navigationPatterns: jsonb("navigation_patterns"),
  anomalyScore: real("anomaly_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => verifications.id),
  overallRiskScore: integer("overall_risk_score").notNull(),
  documentRiskScore: integer("document_risk_score"),
  biometricRiskScore: integer("biometric_risk_score"),
  behavioralRiskScore: integer("behavioral_risk_score"),
  fraudProbability: real("fraud_probability"),
  anomaliesDetected: text("anomalies_detected").array(),
  riskFactors: jsonb("risk_factors"),
  aiModelVersion: text("ai_model_version"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fraudDetectionLogs = pgTable("fraud_detection_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  verificationId: varchar("verification_id").references(() => verifications.id),
  fraudType: text("fraud_type").notNull(),
  severity: text("severity").notNull(),
  detectionMethod: text("detection_method").notNull(),
  confidenceScore: real("confidence_score"),
  evidenceData: jsonb("evidence_data"),
  actionTaken: text("action_taken"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blockchainLedger = pgTable("blockchain_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => verifications.id),
  blockHash: text("block_hash").notNull().unique(),
  previousBlockHash: text("previous_block_hash"),
  transactionData: jsonb("transaction_data").notNull(),
  merkleRoot: text("merkle_root"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  nonce: text("nonce"),
});

export const monitoringAlerts = pgTable("monitoring_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  alertType: text("alert_type").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const digitalWalletCredentials = pgTable("digital_wallet_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  credentialType: text("credential_type").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  verificationHash: text("verification_hash"),
  issuedBy: text("issued_by"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const privacyConsents = pgTable("privacy_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  consentType: text("consent_type").notNull(),
  purpose: text("purpose").notNull(),
  dataScope: text("data_scope").array(),
  grantedTo: text("granted_to"),
  isGranted: boolean("is_granted").notNull(),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
});

export const apiAccessLogs = pgTable("api_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: text("client_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  requestData: jsonb("request_data"),
  responseStatus: integer("response_status"),
  trustScoreShared: integer("trust_score_shared"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const insertBiometricRecordSchema = createInsertSchema(biometricRecords).omit({
  id: true,
  createdAt: true,
});

export const insertBehavioralBiometricSchema = createInsertSchema(behavioralBiometrics).omit({
  id: true,
  createdAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertFraudDetectionLogSchema = createInsertSchema(fraudDetectionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBlockchainLedgerSchema = createInsertSchema(blockchainLedger).omit({
  id: true,
  timestamp: true,
});

export const insertMonitoringAlertSchema = createInsertSchema(monitoringAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertDigitalWalletCredentialSchema = createInsertSchema(digitalWalletCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrivacyConsentSchema = createInsertSchema(privacyConsents).omit({
  id: true,
});

export const insertApiAccessLogSchema = createInsertSchema(apiAccessLogs).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationSessionSchema = createInsertSchema(verificationSessions).omit({
  id: true,
  startedAt: true,
});

export type InsertBiometricRecord = z.infer<typeof insertBiometricRecordSchema>;
export type BiometricRecord = typeof biometricRecords.$inferSelect;

export type InsertBehavioralBiometric = z.infer<typeof insertBehavioralBiometricSchema>;
export type BehavioralBiometric = typeof behavioralBiometrics.$inferSelect;

export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

export type InsertFraudDetectionLog = z.infer<typeof insertFraudDetectionLogSchema>;
export type FraudDetectionLog = typeof fraudDetectionLogs.$inferSelect;

export type InsertBlockchainLedger = z.infer<typeof insertBlockchainLedgerSchema>;
export type BlockchainLedger = typeof blockchainLedger.$inferSelect;

export type InsertMonitoringAlert = z.infer<typeof insertMonitoringAlertSchema>;
export type MonitoringAlert = typeof monitoringAlerts.$inferSelect;

export type InsertDigitalWalletCredential = z.infer<typeof insertDigitalWalletCredentialSchema>;
export type DigitalWalletCredential = typeof digitalWalletCredentials.$inferSelect;

export type InsertPrivacyConsent = z.infer<typeof insertPrivacyConsentSchema>;
export type PrivacyConsent = typeof privacyConsents.$inferSelect;

export type InsertApiAccessLog = z.infer<typeof insertApiAccessLogSchema>;
export type ApiAccessLog = typeof apiAccessLogs.$inferSelect;

export type InsertVerificationSession = z.infer<typeof insertVerificationSessionSchema>;
export type VerificationSession = typeof verificationSessions.$inferSelect;
