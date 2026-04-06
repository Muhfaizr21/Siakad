--
-- PostgreSQL database dump
--

\restrict NrA9hSKz3yKpyPHK2U6n8uRi1EVg6WzLV4Gx78gwrjqJO1LpESxlOJhsF7kwqnT

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.3

-- Started on 2026-03-12 15:38:21 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE dagangplay;
--
-- TOC entry 4678 (class 1262 OID 220525)
-- Name: dagangplay; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE dagangplay WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = icu LOCALE = 'en_US.UTF-8' ICU_LOCALE = 'en-US';


\unrestrict NrA9hSKz3yKpyPHK2U6n8uRi1EVg6WzLV4Gx78gwrjqJO1LpESxlOJhsF7kwqnT
\connect dagangplay
\restrict NrA9hSKz3yKpyPHK2U6n8uRi1EVg6WzLV4Gx78gwrjqJO1LpESxlOJhsF7kwqnT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 244112)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 4679 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 974 (class 1247 OID 244302)
-- Name: BalanceTrxType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BalanceTrxType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL',
    'PURCHASE',
    'REFUND',
    'COMMISSION',
    'BONUS',
    'ADJUSTMENT',
    'MLM_COMMISSION'
);


--
-- TOC entry 1037 (class 1247 OID 244520)
-- Name: BannerPosition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BannerPosition" AS ENUM (
    'HERO',
    'SIDEBAR',
    'POPUP',
    'FOOTER'
);


--
-- TOC entry 1040 (class 1247 OID 244530)
-- Name: ChangeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ChangeType" AS ENUM (
    'MANUAL',
    'SYNC_DIGIFLAZZ',
    'FORMULA_APPLY',
    'BULK_UPDATE'
);


--
-- TOC entry 983 (class 1247 OID 244336)
-- Name: CommissionAppliesTo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionAppliesTo" AS ENUM (
    'ALL',
    'CATEGORY',
    'PRODUCT'
);


--
-- TOC entry 986 (class 1247 OID 244344)
-- Name: CommissionForRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionForRole" AS ENUM (
    'MERCHANT'
);


--
-- TOC entry 989 (class 1247 OID 244348)
-- Name: CommissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionStatus" AS ENUM (
    'PENDING',
    'SETTLED',
    'CANCELLED'
);


--
-- TOC entry 980 (class 1247 OID 244330)
-- Name: CommissionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionType" AS ENUM (
    'FLAT',
    'PERCENTAGE'
);


--
-- TOC entry 971 (class 1247 OID 244292)
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'EXPIRED'
);


--
-- TOC entry 1031 (class 1247 OID 244498)
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'INVESTIGATING',
    'RESOLVED',
    'REJECTED'
);


--
-- TOC entry 968 (class 1247 OID 244286)
-- Name: FeeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FeeType" AS ENUM (
    'FLAT',
    'PERCENTAGE'
);


--
-- TOC entry 1025 (class 1247 OID 244478)
-- Name: FraudRiskLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FraudRiskLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- TOC entry 926 (class 1247 OID 244134)
-- Name: Gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE'
);


--
-- TOC entry 1028 (class 1247 OID 244488)
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'UNPAID',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'PENDING'
);


--
-- TOC entry 1034 (class 1247 OID 244508)
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JobStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'SUCCESS',
    'FAILED',
    'RETRYING'
);


--
-- TOC entry 938 (class 1247 OID 244170)
-- Name: MerchantMemberRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MerchantMemberRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'STAFF'
);


--
-- TOC entry 935 (class 1247 OID 244160)
-- Name: MerchantPlan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MerchantPlan" AS ENUM (
    'FREE',
    'PRO',
    'LEGEND',
    'SUPREME'
);


--
-- TOC entry 932 (class 1247 OID 244150)
-- Name: MerchantStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MerchantStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING_REVIEW'
);


--
-- TOC entry 1004 (class 1247 OID 244398)
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'IN_APP',
    'EMAIL',
    'WHATSAPP',
    'SMS'
);


--
-- TOC entry 1001 (class 1247 OID 244378)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER',
    'PAYMENT',
    'DEPOSIT',
    'WITHDRAWAL',
    'PROMO',
    'SYSTEM',
    'ANNOUNCEMENT',
    'PRICE_CHANGE',
    'SUPPLIER_STATUS'
);


--
-- TOC entry 959 (class 1247 OID 244232)
-- Name: OrderFulfillmentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderFulfillmentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED'
);


--
-- TOC entry 956 (class 1247 OID 244222)
-- Name: OrderPaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderPaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'EXPIRED',
    'REFUNDED'
);


--
-- TOC entry 929 (class 1247 OID 244140)
-- Name: OtpType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OtpType" AS ENUM (
    'EMAIL_VERIFY',
    'PHONE_VERIFY',
    'RESET_PASSWORD',
    'LOGIN_2FA'
);


--
-- TOC entry 962 (class 1247 OID 244244)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'BALANCE',
    'TRIPAY_QRIS',
    'TRIPAY_VA_BCA',
    'TRIPAY_VA_BNI',
    'TRIPAY_VA_BRI',
    'TRIPAY_VA_MANDIRI',
    'TRIPAY_VA_PERMATA',
    'TRIPAY_GOPAY',
    'TRIPAY_OVO',
    'TRIPAY_DANA',
    'TRIPAY_SHOPEEPAY',
    'TRIPAY_ALFAMART',
    'TRIPAY_INDOMARET',
    'MANUAL_TRANSFER'
);


--
-- TOC entry 965 (class 1247 OID 244274)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'EXPIRED',
    'FAILED',
    'REFUNDED'
);


--
-- TOC entry 953 (class 1247 OID 244212)
-- Name: PriceTier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PriceTier" AS ENUM (
    'NORMAL',
    'PRO',
    'LEGEND',
    'SUPREME'
);


--
-- TOC entry 947 (class 1247 OID 244196)
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


--
-- TOC entry 995 (class 1247 OID 244364)
-- Name: PromoAppliesTo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromoAppliesTo" AS ENUM (
    'ALL',
    'CATEGORY',
    'PRODUCT'
);


--
-- TOC entry 998 (class 1247 OID 244372)
-- Name: PromoForRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromoForRole" AS ENUM (
    'ALL',
    'CUSTOMER'
);


--
-- TOC entry 992 (class 1247 OID 244356)
-- Name: PromoType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromoType" AS ENUM (
    'DISCOUNT_FLAT',
    'DISCOUNT_PERCENTAGE',
    'CASHBACK'
);


--
-- TOC entry 920 (class 1247 OID 244114)
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN_STAFF',
    'MERCHANT',
    'CUSTOMER'
);


--
-- TOC entry 1016 (class 1247 OID 244442)
-- Name: SettingType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SettingType" AS ENUM (
    'STRING',
    'NUMBER',
    'BOOLEAN',
    'JSON'
);


--
-- TOC entry 950 (class 1247 OID 244204)
-- Name: SkuStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SkuStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'EMPTY'
);


--
-- TOC entry 941 (class 1247 OID 244178)
-- Name: SupplierCode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SupplierCode" AS ENUM (
    'DIGIFLAZZ',
    'VOUCHERKU',
    'POTATOBOY',
    'APIGAMES'
);


--
-- TOC entry 944 (class 1247 OID 244188)
-- Name: SupplierStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SupplierStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE'
);


--
-- TOC entry 1007 (class 1247 OID 244408)
-- Name: TicketCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketCategory" AS ENUM (
    'PAYMENT',
    'ORDER',
    'ACCOUNT',
    'REFUND',
    'OTHER'
);


--
-- TOC entry 1010 (class 1247 OID 244420)
-- Name: TicketPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


--
-- TOC entry 1013 (class 1247 OID 244430)
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_REPLY',
    'RESOLVED',
    'CLOSED'
);


--
-- TOC entry 923 (class 1247 OID 244124)
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'BANNED'
);


--
-- TOC entry 1019 (class 1247 OID 244452)
-- Name: WebhookEvent; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WebhookEvent" AS ENUM (
    'ORDER_CREATED',
    'ORDER_SUCCESS',
    'ORDER_FAILED',
    'PAYMENT_PAID',
    'DEPOSIT_CONFIRMED',
    'BALANCE_UPDATED',
    'PRICE_CHANGED'
);


--
-- TOC entry 1022 (class 1247 OID 244468)
-- Name: WebhookStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WebhookStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'RETRYING'
);


--
-- TOC entry 977 (class 1247 OID 244320)
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'REJECTED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 269 (class 1259 OID 245416)
-- Name: Announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    "merchantId" text,
    title text NOT NULL,
    content text NOT NULL,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 256 (class 1259 OID 245196)
-- Name: ApiKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiKey" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text,
    name text NOT NULL,
    key text NOT NULL,
    secret text NOT NULL,
    permissions jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 245597)
-- Name: ApiRateLimit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApiRateLimit" (
    id text NOT NULL,
    "userId" text,
    "ipAddress" text NOT NULL,
    endpoint text NOT NULL,
    "hitCount" integer DEFAULT 1 NOT NULL,
    "windowStart" timestamp(3) without time zone NOT NULL,
    "windowEnd" timestamp(3) without time zone NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 283 (class 1259 OID 245643)
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    "merchantId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 245039)
-- Name: BalanceTransaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BalanceTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."BalanceTrxType" NOT NULL,
    amount double precision NOT NULL,
    "balanceBefore" double precision NOT NULL,
    "balanceAfter" double precision NOT NULL,
    "orderId" text,
    "depositId" text,
    "withdrawalId" text,
    description text,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 268 (class 1259 OID 245395)
-- Name: Banner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Banner" (
    id text NOT NULL,
    "merchantId" text,
    title text NOT NULL,
    image text NOT NULL,
    "linkUrl" text,
    "position" public."BannerPosition" DEFAULT 'HERO'::public."BannerPosition" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 244743)
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    image text,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "parentId" text,
    "digiflazzCategory" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 286 (class 1259 OID 246252)
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "chatRoomId" text NOT NULL,
    "senderId" text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 285 (class 1259 OID 246240)
-- Name: ChatRoom; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatRoom" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "lastMessage" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 245094)
-- Name: Commission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Commission" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    status public."CommissionStatus" DEFAULT 'PENDING'::public."CommissionStatus" NOT NULL,
    "settledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 245075)
-- Name: CommissionRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CommissionRule" (
    id text NOT NULL,
    "merchantId" text,
    name text NOT NULL,
    description text,
    type public."CommissionType" NOT NULL,
    value double precision NOT NULL,
    "appliesTo" public."CommissionAppliesTo" DEFAULT 'ALL'::public."CommissionAppliesTo" NOT NULL,
    "categoryId" text,
    "productId" text,
    "forRole" public."CommissionForRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 245283)
-- Name: DailySalesSnapshot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DailySalesSnapshot" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "successOrders" integer DEFAULT 0 NOT NULL,
    "failedOrders" integer DEFAULT 0 NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalProfit" double precision DEFAULT 0 NOT NULL,
    "newCustomers" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 245022)
-- Name: Deposit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Deposit" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text NOT NULL,
    amount double precision NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."DepositStatus" DEFAULT 'PENDING'::public."DepositStatus" NOT NULL,
    "tripayReference" text,
    "tripayMerchantRef" text,
    "tripayPaymentUrl" text,
    "tripayVaNumber" text,
    "tripayQrUrl" text,
    "tripayResponse" jsonb,
    "receiptImage" text,
    "confirmedById" text,
    "confirmedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    note text,
    "expiredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 244647)
-- Name: DeviceTrusted; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DeviceTrusted" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "deviceId" text NOT NULL,
    "deviceName" text,
    "userAgent" text,
    "ipAddress" text,
    "trustedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


--
-- TOC entry 278 (class 1259 OID 245561)
-- Name: DisputeCase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DisputeCase" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    reason text NOT NULL,
    evidence jsonb,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    resolution text,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 245128)
-- Name: DownlineTree; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DownlineTree" (
    id text NOT NULL,
    "parentId" text NOT NULL,
    "childId" text NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 245445)
-- Name: EmailCampaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailCampaign" (
    id text NOT NULL,
    "merchantId" text,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    "targetRole" public."Role",
    "sentCount" integer DEFAULT 0 NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 245382)
-- Name: EmailCampaignLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailCampaignLog" (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "userId" text NOT NULL,
    "isSuccess" boolean NOT NULL,
    "errorMsg" text,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 244620)
-- Name: FraudDetection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FraudDetection" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    "riskLevel" public."FraudRiskLevel" NOT NULL,
    reason text NOT NULL,
    metadata jsonb,
    "isResolved" boolean DEFAULT false NOT NULL,
    "resolvedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 244922)
-- Name: GameNickname; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GameNickname" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "gameUserId" text NOT NULL,
    "serverId" text,
    nickname text NOT NULL,
    "cachedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 244894)
-- Name: GameServer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GameServer" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "serverId" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 244909)
-- Name: GameValidation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GameValidation" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "gameUserId" text NOT NULL,
    "serverId" text,
    nickname text,
    "isValid" boolean NOT NULL,
    "checkedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text
);


--
-- TOC entry 223 (class 1259 OID 244607)
-- Name: IPBlacklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IPBlacklist" (
    id text NOT NULL,
    "ipAddress" text NOT NULL,
    reason text NOT NULL,
    "blockedBy" text NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 259 (class 1259 OID 245247)
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "invoiceNo" text NOT NULL,
    plan public."MerchantPlan" NOT NULL,
    amount double precision NOT NULL,
    tax double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision NOT NULL,
    status public."InvoiceStatus" DEFAULT 'UNPAID'::public."InvoiceStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "tripayReference" text,
    "tripayPaymentUrl" text,
    "tripayResponse" jsonb,
    "paidAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "proofUrl" text
);


--
-- TOC entry 279 (class 1259 OID 245577)
-- Name: JobQueue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobQueue" (
    id text NOT NULL,
    type text NOT NULL,
    payload jsonb NOT NULL,
    status public."JobStatus" DEFAULT 'PENDING'::public."JobStatus" NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "maxRetry" integer DEFAULT 3 NOT NULL,
    error text,
    "scheduledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 244635)
-- Name: LoginAttempt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LoginAttempt" (
    id text NOT NULL,
    "userId" text,
    "ipAddress" text NOT NULL,
    "userAgent" text,
    email text,
    "isSuccess" boolean NOT NULL,
    "failReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 253 (class 1259 OID 245142)
-- Name: MLMCommission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MLMCommission" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    level integer NOT NULL,
    percentage double precision NOT NULL,
    amount double precision NOT NULL,
    status public."CommissionStatus" DEFAULT 'PENDING'::public."CommissionStatus" NOT NULL,
    "settledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 276 (class 1259 OID 245529)
-- Name: MaintenanceSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceSchedule" (
    id text NOT NULL,
    "supplierId" text,
    "productId" text,
    title text NOT NULL,
    description text,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 284 (class 1259 OID 246212)
-- Name: MarketingGuide; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MarketingGuide" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    "videoUrl" text,
    thumbnail text,
    category text,
    "targetPlan" public."MerchantPlan" DEFAULT 'SUPREME'::public."MerchantPlan" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imageUrl" text
);


--
-- TOC entry 227 (class 1259 OID 244659)
-- Name: Merchant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Merchant" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    favicon text,
    "bannerImage" text,
    domain text,
    description text,
    tagline text,
    "contactEmail" text,
    "contactPhone" text,
    "contactWhatsapp" text,
    address text,
    city text,
    province text,
    status public."MerchantStatus" DEFAULT 'PENDING_REVIEW'::public."MerchantStatus" NOT NULL,
    plan public."MerchantPlan" DEFAULT 'FREE'::public."MerchantPlan" NOT NULL,
    "planExpiredAt" timestamp(3) without time zone,
    "isOfficial" boolean DEFAULT false NOT NULL,
    settings jsonb,
    "ownerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- TOC entry 228 (class 1259 OID 244679)
-- Name: MerchantMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MerchantMember" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "userId" text NOT NULL,
    role public."MerchantMemberRole" DEFAULT 'STAFF'::public."MerchantMemberRole" NOT NULL,
    permissions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 287 (class 1259 OID 246284)
-- Name: MerchantProductOverride; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MerchantProductOverride" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "productId" text NOT NULL,
    "customName" text,
    "customThumbnail" text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 244877)
-- Name: MerchantProductPrice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MerchantProductPrice" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "productSkuId" text NOT NULL,
    "userId" text NOT NULL,
    "customPrice" double precision NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    reason text,
    "expiredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customModalPrice" double precision
);


--
-- TOC entry 282 (class 1259 OID 245629)
-- Name: MerchantSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MerchantSetting" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type public."SettingType" DEFAULT 'STRING'::public."SettingType" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 264 (class 1259 OID 245336)
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "imageUrl" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 245352)
-- Name: NotificationTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NotificationTemplate" (
    id text NOT NULL,
    "merchantId" text,
    type public."NotificationType" NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    subject text,
    body text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 244936)
-- Name: Order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text NOT NULL,
    "productId" text NOT NULL,
    "productSkuId" text NOT NULL,
    "productName" text NOT NULL,
    "productSkuName" text NOT NULL,
    "priceTierUsed" public."PriceTier" NOT NULL,
    "basePrice" double precision NOT NULL,
    "sellingPrice" double precision NOT NULL,
    "totalPrice" double precision NOT NULL,
    "gameUserId" text NOT NULL,
    "gameUserServerId" text,
    "gameUserName" text,
    quantity integer DEFAULT 1 NOT NULL,
    "promoCodeId" text,
    "discountAmount" double precision DEFAULT 0 NOT NULL,
    "paymentMethod" public."PaymentMethod",
    "paymentStatus" public."OrderPaymentStatus" DEFAULT 'PENDING'::public."OrderPaymentStatus" NOT NULL,
    "fulfillmentStatus" public."OrderFulfillmentStatus" DEFAULT 'PENDING'::public."OrderFulfillmentStatus" NOT NULL,
    "supplierId" text,
    "supplierRefId" text,
    "supplierResponse" jsonb,
    "serialNumber" text,
    note text,
    "failReason" text,
    "paidAt" timestamp(3) without time zone,
    "processedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "expiredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "merchantModalPrice" double precision
);


--
-- TOC entry 243 (class 1259 OID 244967)
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status text NOT NULL,
    note text,
    "changedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 244592)
-- Name: OtpVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OtpVerification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."OtpType" NOT NULL,
    code text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 244980)
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    amount double precision NOT NULL,
    fee double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "tripayReference" text,
    "tripayMerchantRef" text,
    "tripayPaymentUrl" text,
    "tripayQrUrl" text,
    "tripayVaNumber" text,
    "tripayExpiredTime" timestamp(3) without time zone,
    "tripayResponse" jsonb,
    "paidAt" timestamp(3) without time zone,
    "expiredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 245001)
-- Name: PaymentChannel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PaymentChannel" (
    id text NOT NULL,
    "merchantId" text,
    method public."PaymentMethod" NOT NULL,
    name text NOT NULL,
    icon text,
    fee double precision DEFAULT 0 NOT NULL,
    "feeType" public."FeeType" DEFAULT 'FLAT'::public."FeeType" NOT NULL,
    "minAmount" double precision,
    "maxAmount" double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "tripayConfig" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 244863)
-- Name: PlanTierMapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlanTierMapping" (
    id text NOT NULL,
    plan public."MerchantPlan" NOT NULL,
    tier public."PriceTier" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "updatedBy" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 270 (class 1259 OID 245431)
-- Name: PopupPromo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PopupPromo" (
    id text NOT NULL,
    "merchantId" text,
    title text NOT NULL,
    image text,
    content text,
    "linkUrl" text,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 244760)
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "categoryId" text NOT NULL,
    description text,
    thumbnail text,
    banner text,
    "gameIdLabel" text,
    "gameServerId" boolean DEFAULT false NOT NULL,
    "serverLabel" text,
    "digiflazzBrand" text,
    "digiflazzCategory" text,
    instruction text,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPopular" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 275 (class 1259 OID 245510)
-- Name: ProductReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductReview" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    images jsonb,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 245307)
-- Name: ProductSalesStats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductSalesStats" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "categoryId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalSold" integer DEFAULT 0 NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 244784)
-- Name: ProductSku; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductSku" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "supplierId" text NOT NULL,
    name text NOT NULL,
    "supplierCode" text NOT NULL,
    "backupSupplierId" text,
    "backupSupplierCode" text,
    "basePrice" double precision NOT NULL,
    "priceNormal" double precision NOT NULL,
    "pricePro" double precision NOT NULL,
    "priceLegend" double precision NOT NULL,
    "priceSupreme" double precision NOT NULL,
    "marginNormal" double precision NOT NULL,
    "marginPro" double precision NOT NULL,
    "marginLegend" double precision NOT NULL,
    "marginSupreme" double precision NOT NULL,
    stock integer DEFAULT '-1'::integer NOT NULL,
    status public."SkuStatus" DEFAULT 'ACTIVE'::public."SkuStatus" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 245159)
-- Name: PromoCode; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PromoCode" (
    id text NOT NULL,
    "merchantId" text,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    type public."PromoType" NOT NULL,
    value double precision NOT NULL,
    "maxDiscount" double precision,
    "minPurchase" double precision,
    quota integer,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "appliesTo" public."PromoAppliesTo" DEFAULT 'ALL'::public."PromoAppliesTo" NOT NULL,
    "categoryId" text,
    "productSkuId" text,
    "forRole" public."PromoForRole" DEFAULT 'ALL'::public."PromoForRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 255 (class 1259 OID 245182)
-- Name: PromoUsage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PromoUsage" (
    id text NOT NULL,
    "promoCodeId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text NOT NULL,
    "discountAmount" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 266 (class 1259 OID 245368)
-- Name: PushNotificationLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PushNotificationLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    "isSuccess" boolean NOT NULL,
    "errorMsg" text,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 245111)
-- Name: ReferralReward; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReferralReward" (
    id text NOT NULL,
    "referrerId" text NOT NULL,
    "referredId" text NOT NULL,
    "orderId" text,
    amount double precision NOT NULL,
    type text NOT NULL,
    status public."CommissionStatus" DEFAULT 'PENDING'::public."CommissionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 277 (class 1259 OID 245545)
-- Name: RefundPolicy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefundPolicy" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "isRefundable" boolean DEFAULT true NOT NULL,
    "maxHours" integer DEFAULT 24 NOT NULL,
    conditions text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 260 (class 1259 OID 245268)
-- Name: SubscriptionHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SubscriptionHistory" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    "oldPlan" public."MerchantPlan",
    "newPlan" public."MerchantPlan" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    amount double precision NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 244694)
-- Name: Supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Supplier" (
    id text NOT NULL,
    name text NOT NULL,
    code public."SupplierCode" NOT NULL,
    "apiUrl" text NOT NULL,
    "apiKey" text NOT NULL,
    "apiSecret" text NOT NULL,
    status public."SupplierStatus" DEFAULT 'ACTIVE'::public."SupplierStatus" NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    "lastSyncAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 244728)
-- Name: SupplierBalanceHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierBalanceHistory" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    "balanceBefore" double precision NOT NULL,
    "balanceAfter" double precision NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 244714)
-- Name: SupplierLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupplierLog" (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "orderId" text,
    method text NOT NULL,
    endpoint text NOT NULL,
    "requestBody" jsonb,
    "responseBody" jsonb,
    "httpStatus" integer,
    duration integer,
    "isSuccess" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 273 (class 1259 OID 245475)
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "merchantId" text NOT NULL,
    "orderId" text,
    subject text NOT NULL,
    description text NOT NULL,
    category public."TicketCategory" NOT NULL,
    priority public."TicketPriority" DEFAULT 'MEDIUM'::public."TicketPriority" NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    "assignedToId" text,
    "resolvedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 274 (class 1259 OID 245495)
-- Name: SupportTicketReply; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SupportTicketReply" (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    attachments jsonb,
    "isFromStaff" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 245616)
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSetting" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type public."SettingType" DEFAULT 'STRING'::public."SettingType" NOT NULL,
    description text,
    "group" text,
    "updatedBy" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 244840)
-- Name: TierPriceHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TierPriceHistory" (
    id text NOT NULL,
    "productSkuId" text NOT NULL,
    "oldBasePrice" double precision NOT NULL,
    "oldPriceNormal" double precision NOT NULL,
    "oldPricePro" double precision NOT NULL,
    "oldPriceLegend" double precision NOT NULL,
    "oldPriceSupreme" double precision NOT NULL,
    "newBasePrice" double precision NOT NULL,
    "newPriceNormal" double precision NOT NULL,
    "newPricePro" double precision NOT NULL,
    "newPriceLegend" double precision NOT NULL,
    "newPriceSupreme" double precision NOT NULL,
    "changeType" public."ChangeType" NOT NULL,
    "changedBy" text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text
);


--
-- TOC entry 235 (class 1259 OID 244814)
-- Name: TierPricingRule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TierPricingRule" (
    id text NOT NULL,
    "categoryId" text,
    "marginNormal" double precision NOT NULL,
    "marginPro" double precision NOT NULL,
    "marginLegend" double precision NOT NULL,
    "marginSupreme" double precision NOT NULL,
    "minMarginNormal" double precision DEFAULT 5.0 NOT NULL,
    "minMarginPro" double precision DEFAULT 3.0 NOT NULL,
    "minMarginLegend" double precision DEFAULT 2.0 NOT NULL,
    "minMarginSupreme" double precision DEFAULT 1.0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 244539)
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text,
    phone text,
    password text NOT NULL,
    name text NOT NULL,
    username text,
    avatar text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "adminPermissions" jsonb DEFAULT '[]'::jsonb,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "referralCode" text NOT NULL,
    "referredById" text,
    "merchantId" text,
    balance double precision DEFAULT 0 NOT NULL,
    "bonusBalance" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


--
-- TOC entry 263 (class 1259 OID 245324)
-- Name: UserActivityLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserActivityLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    page text,
    metadata jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 272 (class 1259 OID 245463)
-- Name: UserFavorite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserFavorite" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 244564)
-- Name: UserProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text,
    "birthDate" timestamp(3) without time zone,
    gender public."Gender",
    address text,
    city text,
    province text,
    "postalCode" text,
    "idCardNumber" text,
    "bankName" text,
    "bankAccountNumber" text,
    "bankAccountName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 244576)
-- Name: UserSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "refreshToken" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    device text,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "lastActiveAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 245213)
-- Name: WebhookEndpoint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WebhookEndpoint" (
    id text NOT NULL,
    "merchantId" text NOT NULL,
    url text NOT NULL,
    secret text NOT NULL,
    events jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 258 (class 1259 OID 245230)
-- Name: WebhookLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WebhookLog" (
    id text NOT NULL,
    "webhookEndpointId" text NOT NULL,
    event public."WebhookEvent" NOT NULL,
    payload jsonb NOT NULL,
    "responseStatus" integer,
    "responseBody" text,
    status public."WebhookStatus" DEFAULT 'PENDING'::public."WebhookStatus" NOT NULL,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "nextRetryAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 245054)
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Withdrawal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    fee double precision DEFAULT 0 NOT NULL,
    "netAmount" double precision NOT NULL,
    "bankName" text NOT NULL,
    "bankAccountNumber" text NOT NULL,
    "bankAccountName" text NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    "processedById" text,
    "processedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    note text,
    "receiptImage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 4654 (class 0 OID 245416)
-- Dependencies: 269
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4641 (class 0 OID 245196)
-- Dependencies: 256
-- Data for Name: ApiKey; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4665 (class 0 OID 245597)
-- Dependencies: 280
-- Data for Name: ApiRateLimit; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4668 (class 0 OID 245643)
-- Dependencies: 283
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AuditLog" VALUES ('cmmm386tt00fe01lbem2cf5u4', NULL, NULL, 'DIGIFLAZZ_FULL_SYNC', 'ProductSku', NULL, '{}', '{"totalIn": 1342, "newCount": 486, "updatedCount": 0}', NULL, NULL, '2026-03-11 13:41:38.321');


--
-- TOC entry 4632 (class 0 OID 245039)
-- Dependencies: 247
-- Data for Name: BalanceTransaction; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4653 (class 0 OID 245395)
-- Dependencies: 268
-- Data for Name: Banner; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4617 (class 0 OID 244743)
-- Dependencies: 232
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Category" VALUES ('cmmm2sm2x000bs0ojja9nia89', 'Mobile Legends', 'mobile-legends', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png', NULL, 0, true, NULL, NULL, '2026-03-11 13:29:31.593', '2026-03-11 13:29:31.593');
INSERT INTO public."Category" VALUES ('cmmm2sm32000cs0oj43tlavlc', 'Free Fire', 'free-fire', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ff.png', NULL, 0, true, NULL, NULL, '2026-03-11 13:29:31.598', '2026-03-11 13:29:31.598');
INSERT INTO public."Category" VALUES ('cmmm2sm34000ds0ojezz4g7oc', 'Genshin Impact', 'genshin-impact', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-genshin.png', NULL, 0, true, NULL, NULL, '2026-03-11 13:29:31.6', '2026-03-11 13:29:31.6');
INSERT INTO public."Category" VALUES ('cmmm37vvg000301lby0gqe5uu', 'Blood Strike', 'blood-strike', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:24.111', '2026-03-11 13:41:24.111');
INSERT INTO public."Category" VALUES ('cmmm37vzq000601lbkdiihpsf', 'Call of Duty MOBILE', 'call-of-duty-mobile', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:24.263', '2026-03-11 13:41:24.263');
INSERT INTO public."Category" VALUES ('cmmm37wa7000f01lbukqhxana', 'League of Legends PC', 'league-of-legends-pc', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:24.648', '2026-03-11 13:41:24.648');
INSERT INTO public."Category" VALUES ('cmmm37wrj000x01lbb7zsyzb5', 'ARENA OF VALOR', 'arena-of-valor', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:25.275', '2026-03-11 13:41:25.275');
INSERT INTO public."Category" VALUES ('cmmm37x1d001a01lbdw8rz8ac', 'Bleach Soul Resonance', 'bleach-soul-resonance', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:25.629', '2026-03-11 13:41:25.629');
INSERT INTO public."Category" VALUES ('cmmm37xhl002001lbaryjxlx3', 'Crossfire', 'crossfire', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:26.209', '2026-03-11 13:41:26.209');
INSERT INTO public."Category" VALUES ('cmmm37xv0002g01lbquetk3sf', 'Dragon City', 'dragon-city', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:26.697', '2026-03-11 13:41:26.697');
INSERT INTO public."Category" VALUES ('cmmm37y0x002p01lbkso0xmh9', 'PUBG MOBILE', 'pubg-mobile', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:26.91', '2026-03-11 13:41:26.91');
INSERT INTO public."Category" VALUES ('cmmm37y1l002s01lbmat8q2sv', 'Delta Force', 'delta-force', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:26.934', '2026-03-11 13:41:26.934');
INSERT INTO public."Category" VALUES ('cmmm37y9e002z01lbga16tuvh', 'GARENA', 'garena', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:27.215', '2026-03-11 13:41:27.215');
INSERT INTO public."Category" VALUES ('cmmm37ydt003801lbannm2sc2', 'TELKOMSEL', 'telkomsel', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:27.373', '2026-03-11 13:41:27.373');
INSERT INTO public."Category" VALUES ('cmmm37yfz003d01lbs1k1zhhn', 'Revelation Infinite Journey', 'revelation-infinite-journey', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:27.452', '2026-03-11 13:41:27.452');
INSERT INTO public."Category" VALUES ('cmmm37ykm003m01lbt1f7ln1f', 'Free Fire Max', 'free-fire-max', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:27.619', '2026-03-11 13:41:27.619');
INSERT INTO public."Category" VALUES ('cmmm37yxl004701lb35357bs0', 'FC Mobile', 'fc-mobile', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:28.086', '2026-03-11 13:41:28.086');
INSERT INTO public."Category" VALUES ('cmmm380bb006801lbalthnall', 'Haikyu Fly High', 'haikyu-fly-high', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:29.876', '2026-03-11 13:41:29.876');
INSERT INTO public."Category" VALUES ('cmmm380f8006g01lbr0u8hpes', 'Honor of Kings', 'honor-of-kings', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:30.016', '2026-03-11 13:41:30.016');
INSERT INTO public."Category" VALUES ('cmmm380mz006u01lb2ivd6sqi', 'Honkai Impact 3', 'honkai-impact-3', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:30.296', '2026-03-11 13:41:30.296');
INSERT INTO public."Category" VALUES ('cmmm380pi007001lbwekt0qa4', 'Honkai Star Rail', 'honkai-star-rail', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:30.387', '2026-03-11 13:41:30.387');
INSERT INTO public."Category" VALUES ('cmmm3811k007f01lbue0qzvik', 'League of Legends Wild Rift', 'league-of-legends-wild-rift', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:30.822', '2026-03-11 13:41:30.822');
INSERT INTO public."Category" VALUES ('cmmm381qk008c01lbxnp5mqb4', 'Lords Mobile', 'lords-mobile', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:31.721', '2026-03-11 13:41:31.721');
INSERT INTO public."Category" VALUES ('cmmm381yf008o01lbfpuz89lo', 'Magic Chess', 'magic-chess', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:32.005', '2026-03-11 13:41:32.005');
INSERT INTO public."Category" VALUES ('cmmm3835700am01lbqora1qup', 'Mobile Legends Adventure', 'mobile-legends-adventure', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:33.544', '2026-03-11 13:41:33.544');
INSERT INTO public."Category" VALUES ('cmmm383fi00b501lbi1amg0ni', 'One Punch Man', 'one-punch-man', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:33.915', '2026-03-11 13:41:33.915');
INSERT INTO public."Category" VALUES ('cmmm383tv00bq01lbpkfpagya', 'POINT BLANK', 'point-blank', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:34.43', '2026-03-11 13:41:34.43');
INSERT INTO public."Category" VALUES ('cmmm3841t00c401lbxaq5b80x', 'Pokemon Unite', 'pokemon-unite', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:34.718', '2026-03-11 13:41:34.718');
INSERT INTO public."Category" VALUES ('cmmm3856c00cy01lbro1dtalv', 'Ragnarok Origin', 'ragnarok-origin', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:36.177', '2026-03-11 13:41:36.177');
INSERT INTO public."Category" VALUES ('cmmm3859900d401lbhc7j6l68', 'Ragnarok Twilight', 'ragnarok-twilight', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:36.282', '2026-03-11 13:41:36.282');
INSERT INTO public."Category" VALUES ('cmmm385go00dh01lbq4q8s20q', 'Sausage Man', 'sausage-man', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:36.549', '2026-03-11 13:41:36.549');
INSERT INTO public."Category" VALUES ('cmmm385x500e201lbxo3lnen4', 'State of Survival', 'state-of-survival', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:37.142', '2026-03-11 13:41:37.142');
INSERT INTO public."Category" VALUES ('cmmm3864f00ed01lb526xrph4', 'Stumble Guys', 'stumble-guys', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:37.402', '2026-03-11 13:41:37.402');
INSERT INTO public."Category" VALUES ('cmmm3869z00ej01lbcxgt45ak', 'Valorant', 'valorant', NULL, NULL, NULL, 0, true, NULL, NULL, '2026-03-11 13:41:37.602', '2026-03-11 13:41:37.602');


--
-- TOC entry 4671 (class 0 OID 246252)
-- Dependencies: 286
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4670 (class 0 OID 246240)
-- Dependencies: 285
-- Data for Name: ChatRoom; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ChatRoom" VALUES ('cmmm3d0w200fh01lblye0xntb', 'cmmm2sm1t0006s0oj6pbhhu4x', NULL, '2026-03-11 13:45:23.891', '2026-03-11 13:45:23.891');


--
-- TOC entry 4635 (class 0 OID 245094)
-- Dependencies: 250
-- Data for Name: Commission; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4634 (class 0 OID 245075)
-- Dependencies: 249
-- Data for Name: CommissionRule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4646 (class 0 OID 245283)
-- Dependencies: 261
-- Data for Name: DailySalesSnapshot; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4631 (class 0 OID 245022)
-- Dependencies: 246
-- Data for Name: Deposit; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4611 (class 0 OID 244647)
-- Dependencies: 226
-- Data for Name: DeviceTrusted; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4663 (class 0 OID 245561)
-- Dependencies: 278
-- Data for Name: DisputeCase; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4637 (class 0 OID 245128)
-- Dependencies: 252
-- Data for Name: DownlineTree; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4656 (class 0 OID 245445)
-- Dependencies: 271
-- Data for Name: EmailCampaign; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4652 (class 0 OID 245382)
-- Dependencies: 267
-- Data for Name: EmailCampaignLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4609 (class 0 OID 244620)
-- Dependencies: 224
-- Data for Name: FraudDetection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4626 (class 0 OID 244922)
-- Dependencies: 241
-- Data for Name: GameNickname; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4624 (class 0 OID 244894)
-- Dependencies: 239
-- Data for Name: GameServer; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4625 (class 0 OID 244909)
-- Dependencies: 240
-- Data for Name: GameValidation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4608 (class 0 OID 244607)
-- Dependencies: 223
-- Data for Name: IPBlacklist; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4644 (class 0 OID 245247)
-- Dependencies: 259
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4664 (class 0 OID 245577)
-- Dependencies: 279
-- Data for Name: JobQueue; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4610 (class 0 OID 244635)
-- Dependencies: 225
-- Data for Name: LoginAttempt; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."LoginAttempt" VALUES ('cmmm2ubn6000201lb7gekr1ik', 'cmmm2sm0p0000s0oj0afl3s24', '::ffff:172.21.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', NULL, true, NULL, '2026-03-11 13:30:51.378');
INSERT INTO public."LoginAttempt" VALUES ('cmmm392r600ff01lb9xn44mhp', 'cmmm2sm0p0000s0oj0afl3s24', '::ffff:172.21.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', NULL, true, NULL, '2026-03-11 13:42:19.698');
INSERT INTO public."LoginAttempt" VALUES ('cmmm3d0b200fg01lb8cfvs8h8', 'cmmm2sm1q0005s0ojuuivxd0x', '::ffff:172.21.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', NULL, true, NULL, '2026-03-11 13:45:23.15');


--
-- TOC entry 4638 (class 0 OID 245142)
-- Dependencies: 253
-- Data for Name: MLMCommission; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4661 (class 0 OID 245529)
-- Dependencies: 276
-- Data for Name: MaintenanceSchedule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4669 (class 0 OID 246212)
-- Dependencies: 284
-- Data for Name: MarketingGuide; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4612 (class 0 OID 244659)
-- Dependencies: 227
-- Data for Name: Merchant; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Merchant" VALUES ('cmmm2sm1d0002s0oj6tqybwez', 'Fantasi Gamer', 'fantasi-gamer', NULL, NULL, NULL, 'fantasigamer.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'SUPREME', NULL, false, NULL, 'cmmm2sm170001s0oj1yu9qrrw', '2026-03-11 13:29:31.537', '2026-03-11 13:29:31.537', NULL);
INSERT INTO public."Merchant" VALUES ('cmmm2sm1n0004s0ojnfss2jyl', 'Arb Store', 'arb-store', NULL, NULL, NULL, 'arbstore.id', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'LEGEND', NULL, false, NULL, 'cmmm2sm1j0003s0oja163dws3', '2026-03-11 13:29:31.547', '2026-03-11 13:29:31.547', NULL);
INSERT INTO public."Merchant" VALUES ('cmmm2sm1t0006s0oj6pbhhu4x', 'Rolly Store', 'rolly-store', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'PRO', NULL, false, NULL, 'cmmm2sm1q0005s0ojuuivxd0x', '2026-03-11 13:29:31.553', '2026-03-11 13:29:31.553', NULL);
INSERT INTO public."Merchant" VALUES ('cmmm2sm210008s0ojva03vmec', 'Budi Gaming', 'budi-gaming', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PENDING_REVIEW', 'PRO', NULL, false, NULL, 'cmmm2sm1x0007s0ojr3uywtdy', '2026-03-11 13:29:31.56', '2026-03-11 13:29:31.56', NULL);


--
-- TOC entry 4613 (class 0 OID 244679)
-- Dependencies: 228
-- Data for Name: MerchantMember; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4672 (class 0 OID 246284)
-- Dependencies: 287
-- Data for Name: MerchantProductOverride; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4623 (class 0 OID 244877)
-- Dependencies: 238
-- Data for Name: MerchantProductPrice; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MerchantProductPrice" VALUES ('cmmm4v8hb00fi01lb4qnwyzgb', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm37wt3001001lbyvjrr7or', 'cmmm2sm1q0005s0ojuuivxd0x', 6972, true, NULL, NULL, '2026-03-11 14:27:33.166', '2026-03-11 14:27:35.225', NULL);


--
-- TOC entry 4667 (class 0 OID 245629)
-- Dependencies: 282
-- Data for Name: MerchantSetting; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4649 (class 0 OID 245336)
-- Dependencies: 264
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4650 (class 0 OID 245352)
-- Dependencies: 265
-- Data for Name: NotificationTemplate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4627 (class 0 OID 244936)
-- Dependencies: 242
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Order" VALUES ('cmmm2sm5t000ps0ojrchsc4dh', 'TRX-1773235771669-74267', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 13:29:31.669', NULL, '2026-03-08 13:29:31.669', NULL, NULL, '2026-03-08 13:29:31.669', '2026-03-11 13:29:31.697', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smcc000rs0ojlfkg2xgd', 'TRX-1773235771932-27095', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:31.931', NULL, '2026-02-26 13:29:31.931', NULL, NULL, '2026-02-26 13:29:31.931', '2026-03-11 13:29:31.932', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smck000ts0ojfg1ta8p5', 'TRX-1773235771939-18778', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-10 13:29:31.939', NULL, '2026-03-10 13:29:31.939', NULL, NULL, '2026-03-10 13:29:31.939', '2026-03-11 13:29:31.94', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smcp000vs0ojxmd805cz', 'TRX-1773235771945-28214', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000ks0oj7ie6amsz', 'Mobile Legends Diamonds', '257 Diamonds', 'NORMAL', 57000, 63000, 63000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:31.945', NULL, '2026-02-26 13:29:31.945', NULL, NULL, '2026-02-26 13:29:31.945', '2026-03-11 13:29:31.945', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smcu000xs0ojirivx623', 'TRX-1773235771950-38072', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000ks0oj7ie6amsz', 'Mobile Legends Diamonds', '257 Diamonds', 'NORMAL', 57000, 63000, 63000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:31.95', NULL, '2026-03-09 13:29:31.95', NULL, NULL, '2026-03-09 13:29:31.95', '2026-03-11 13:29:31.95', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smcz000zs0ojj6uq77uh', 'TRX-1773235771954-63170', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-04 13:29:31.954', NULL, '2026-03-04 13:29:31.954', NULL, NULL, '2026-03-04 13:29:31.954', '2026-03-11 13:29:31.955', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smd80011s0ojp0yn6nht', 'TRX-1773235771964-39542', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-14 13:29:31.964', NULL, '2026-02-14 13:29:31.964', NULL, NULL, '2026-02-14 13:29:31.964', '2026-03-11 13:29:31.964', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smdl0013s0oj0tm32pl0', 'TRX-1773235771976-63027', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-23 13:29:31.976', NULL, '2026-02-23 13:29:31.976', NULL, NULL, '2026-02-23 13:29:31.976', '2026-03-11 13:29:31.977', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smdq0015s0ojlba0g82r', 'TRX-1773235771981-92461', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm45000os0oj5vq0v6wu', 'Genshin Impact Genesis Crystals', 'Blessing of the Welkin Moon', 'NORMAL', 65000, 75000, 75000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:31.981', NULL, '2026-02-20 13:29:31.981', NULL, NULL, '2026-02-20 13:29:31.981', '2026-03-11 13:29:31.982', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smdz0017s0oj7ngoeesd', 'TRX-1773235771990-92500', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-21 13:29:31.99', NULL, '2026-02-21 13:29:31.99', NULL, NULL, '2026-02-21 13:29:31.99', '2026-03-11 13:29:31.991', NULL);
INSERT INTO public."Order" VALUES ('cmmm2sme40019s0ojscekwvd9', 'TRX-1773235771995-66594', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-04 13:29:31.995', NULL, '2026-03-04 13:29:31.995', NULL, NULL, '2026-03-04 13:29:31.995', '2026-03-11 13:29:31.996', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smer001bs0ojfvqrg4mp', 'TRX-1773235772018-2369', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-10 13:29:32.018', NULL, '2026-02-10 13:29:32.018', NULL, NULL, '2026-02-10 13:29:32.018', '2026-03-11 13:29:32.019', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smfh001ds0ojaun9ir2o', 'TRX-1773235772040-34649', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:32.04', NULL, '2026-03-09 13:29:32.04', NULL, NULL, '2026-03-09 13:29:32.04', '2026-03-11 13:29:32.045', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smfx001fs0ojymktutl8', 'TRX-1773235772061-76103', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000ks0oj7ie6amsz', 'Mobile Legends Diamonds', '257 Diamonds', 'NORMAL', 57000, 63000, 63000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 13:29:32.061', NULL, '2026-02-13 13:29:32.061', NULL, NULL, '2026-02-13 13:29:32.061', '2026-03-11 13:29:32.061', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smgi001hs0ojuj0rhebc', 'TRX-1773235772081-31797', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 13:29:32.081', NULL, '2026-02-12 13:29:32.081', NULL, NULL, '2026-02-12 13:29:32.081', '2026-03-11 13:29:32.082', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smgy001js0oj01ztqik8', 'TRX-1773235772096-9669', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-01 13:29:32.096', NULL, '2026-03-01 13:29:32.096', NULL, NULL, '2026-03-01 13:29:32.096', '2026-03-11 13:29:32.098', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smha001ls0oj1mpkkhxn', 'TRX-1773235772109-39355', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.109', NULL, '2026-02-20 13:29:32.109', NULL, NULL, '2026-02-20 13:29:32.109', '2026-03-11 13:29:32.11', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smhh001ns0ojz74wfzk1', 'TRX-1773235772116-57868', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm45000ns0ojpezhxk5g', 'Genshin Impact Genesis Crystals', '60 Genesis Crystals', 'NORMAL', 13500, 15500, 15500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.116', NULL, '2026-02-20 13:29:32.116', NULL, NULL, '2026-02-20 13:29:32.116', '2026-03-11 13:29:32.117', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smhm001ps0ojr5vmnxeu', 'TRX-1773235772121-55724', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-01 13:29:32.121', NULL, '2026-03-01 13:29:32.121', NULL, NULL, '2026-03-01 13:29:32.121', '2026-03-11 13:29:32.122', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smmo001rs0ojxnz7hsmv', 'TRX-1773235772304-78737', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-18 13:29:32.304', NULL, '2026-02-18 13:29:32.304', NULL, NULL, '2026-02-18 13:29:32.304', '2026-03-11 13:29:32.304', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smn4001ts0ojq4n2zpga', 'TRX-1773235772320-65164', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-10 13:29:32.32', NULL, '2026-03-10 13:29:32.32', NULL, NULL, '2026-03-10 13:29:32.32', '2026-03-11 13:29:32.32', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smn9001vs0ojr6thzq6j', 'TRX-1773235772325-48485', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-28 13:29:32.324', NULL, '2026-02-28 13:29:32.324', NULL, NULL, '2026-02-28 13:29:32.324', '2026-03-11 13:29:32.325', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smnd001xs0ojn9y2pl7e', 'TRX-1773235772329-3319', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm45000os0oj5vq0v6wu', 'Genshin Impact Genesis Crystals', 'Blessing of the Welkin Moon', 'NORMAL', 65000, 75000, 75000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:32.329', NULL, '2026-02-26 13:29:32.329', NULL, NULL, '2026-02-26 13:29:32.329', '2026-03-11 13:29:32.329', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smnh001zs0ojf669napy', 'TRX-1773235772333-48229', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-22 13:29:32.333', NULL, '2026-02-22 13:29:32.333', NULL, NULL, '2026-02-22 13:29:32.333', '2026-03-11 13:29:32.333', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smnl0021s0ojuyudujnw', 'TRX-1773235772337-88353', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-14 13:29:32.336', NULL, '2026-02-14 13:29:32.336', NULL, NULL, '2026-02-14 13:29:32.336', '2026-03-11 13:29:32.337', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smns0023s0ojgszb8shk', 'TRX-1773235772343-27244', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-16 13:29:32.343', NULL, '2026-02-16 13:29:32.343', NULL, NULL, '2026-02-16 13:29:32.343', '2026-03-11 13:29:32.344', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smnw0025s0ojeqsrase9', 'TRX-1773235772347-86227', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 13:29:32.347', NULL, '2026-03-05 13:29:32.347', NULL, NULL, '2026-03-05 13:29:32.347', '2026-03-11 13:29:32.348', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smo80027s0oji8h3f9vo', 'TRX-1773235772360-51274', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-16 13:29:32.36', NULL, '2026-02-16 13:29:32.36', NULL, NULL, '2026-02-16 13:29:32.36', '2026-03-11 13:29:32.36', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smof0029s0ojuge33bhn', 'TRX-1773235772367-58717', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-19 13:29:32.367', NULL, '2026-02-19 13:29:32.367', NULL, NULL, '2026-02-19 13:29:32.367', '2026-03-11 13:29:32.367', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smoo002bs0ojbajjftr9', 'TRX-1773235772376-5353', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm45000os0oj5vq0v6wu', 'Genshin Impact Genesis Crystals', 'Blessing of the Welkin Moon', 'NORMAL', 65000, 75000, 75000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-06 13:29:32.375', NULL, '2026-03-06 13:29:32.375', NULL, NULL, '2026-03-06 13:29:32.375', '2026-03-11 13:29:32.376', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smos002ds0oj030jk27c', 'TRX-1773235772379-86640', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 13:29:32.379', NULL, '2026-02-12 13:29:32.379', NULL, NULL, '2026-02-12 13:29:32.379', '2026-03-11 13:29:32.38', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smox002fs0ojfux5i6o7', 'TRX-1773235772385-23732', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 13:29:32.385', NULL, '2026-03-05 13:29:32.385', NULL, NULL, '2026-03-05 13:29:32.385', '2026-03-11 13:29:32.385', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smp2002hs0oju37w9qaw', 'TRX-1773235772390-48285', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:32.39', NULL, '2026-03-09 13:29:32.39', NULL, NULL, '2026-03-09 13:29:32.39', '2026-03-11 13:29:32.39', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smp7002js0ojonma3i93', 'TRX-1773235772395-98314', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-18 13:29:32.395', NULL, '2026-02-18 13:29:32.395', NULL, NULL, '2026-02-18 13:29:32.395', '2026-03-11 13:29:32.395', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smpb002ls0ojexntg8d2', 'TRX-1773235772399-33220', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-23 13:29:32.399', NULL, '2026-02-23 13:29:32.399', NULL, NULL, '2026-02-23 13:29:32.399', '2026-03-11 13:29:32.399', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smpi002ns0ojbgkgnlty', 'TRX-1773235772405-65785', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm45000ns0ojpezhxk5g', 'Genshin Impact Genesis Crystals', '60 Genesis Crystals', 'NORMAL', 13500, 15500, 15500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 13:29:32.405', NULL, '2026-02-13 13:29:32.405', NULL, NULL, '2026-02-13 13:29:32.405', '2026-03-11 13:29:32.406', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smpr002ps0ojn61gwqui', 'TRX-1773235772414-44386', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ms0ojiir2idm8', 'Free Fire Diamonds', '355 Diamonds', 'NORMAL', 45000, 50000, 50000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-07 13:29:32.414', NULL, '2026-03-07 13:29:32.414', NULL, NULL, '2026-03-07 13:29:32.414', '2026-03-11 13:29:32.415', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smq2002rs0oj29t0ytqc', 'TRX-1773235772424-24773', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000js0oj0spk8b41', 'Mobile Legends Diamonds', '172 Diamonds', 'NORMAL', 38000, 42000, 42000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-15 13:29:32.423', NULL, '2026-02-15 13:29:32.423', NULL, NULL, '2026-02-15 13:29:32.423', '2026-03-11 13:29:32.425', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smq7002ts0ojqpmx41n1', 'TRX-1773235772431-72097', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm45000ls0ojp0suua0t', 'Free Fire Diamonds', '140 Diamonds', 'NORMAL', 18000, 20000, 20000, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.431', NULL, '2026-02-20 13:29:32.431', NULL, NULL, '2026-02-20 13:29:32.431', '2026-03-11 13:29:32.431', NULL);
INSERT INTO public."Order" VALUES ('cmmm2smqc002vs0oj9a3qz1m3', 'TRX-1773235772436-63699', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm45000is0ojok5nzrrg', 'Mobile Legends Diamonds', '86 Diamonds', 'NORMAL', 19500, 21500, 21500, '12345678', NULL, NULL, 1, NULL, 0, 'TRIPAY_QRIS', 'PAID', 'SUCCESS', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-22 13:29:32.436', NULL, '2026-02-22 13:29:32.436', NULL, NULL, '2026-02-22 13:29:32.436', '2026-03-11 13:29:32.436', NULL);


--
-- TOC entry 4628 (class 0 OID 244967)
-- Dependencies: 243
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4607 (class 0 OID 244592)
-- Dependencies: 222
-- Data for Name: OtpVerification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4629 (class 0 OID 244980)
-- Dependencies: 244
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Payment" VALUES ('cmmm2smc5000qs0oj1sk0xscu', 'cmmm2sm5t000ps0ojrchsc4dh', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235771669-74267', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 13:29:31.669', NULL, '2026-03-08 13:29:31.669', '2026-03-11 13:29:31.925');
INSERT INTO public."Payment" VALUES ('cmmm2smci000ss0ojkmaw52pp', 'cmmm2smcc000rs0ojlfkg2xgd', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235771932-27095', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:31.931', NULL, '2026-02-26 13:29:31.931', '2026-03-11 13:29:31.937');
INSERT INTO public."Payment" VALUES ('cmmm2smcn000us0ojzsjw1a2e', 'cmmm2smck000ts0ojfg1ta8p5', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235771939-18778', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-10 13:29:31.939', NULL, '2026-03-10 13:29:31.939', '2026-03-11 13:29:31.943');
INSERT INTO public."Payment" VALUES ('cmmm2smcs000ws0oj9on0zcvd', 'cmmm2smcp000vs0ojxmd805cz', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 63000, 0, 63000, 'PAID', 'T-TRX-1773235771945-28214', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:31.945', NULL, '2026-02-26 13:29:31.945', '2026-03-11 13:29:31.948');
INSERT INTO public."Payment" VALUES ('cmmm2smcx000ys0oj25fiaaph', 'cmmm2smcu000xs0ojirivx623', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 63000, 0, 63000, 'PAID', 'T-TRX-1773235771950-38072', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:31.95', NULL, '2026-03-09 13:29:31.95', '2026-03-11 13:29:31.953');
INSERT INTO public."Payment" VALUES ('cmmm2smd50010s0oja543vslo', 'cmmm2smcz000zs0ojj6uq77uh', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235771954-63170', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-04 13:29:31.954', NULL, '2026-03-04 13:29:31.954', '2026-03-11 13:29:31.961');
INSERT INTO public."Payment" VALUES ('cmmm2smdh0012s0ojfflmwvvj', 'cmmm2smd80011s0ojp0yn6nht', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235771964-39542', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-14 13:29:31.964', NULL, '2026-02-14 13:29:31.964', '2026-03-11 13:29:31.973');
INSERT INTO public."Payment" VALUES ('cmmm2smdn0014s0ojw17lwspy', 'cmmm2smdl0013s0oj0tm32pl0', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235771976-63027', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-23 13:29:31.976', NULL, '2026-02-23 13:29:31.976', '2026-03-11 13:29:31.979');
INSERT INTO public."Payment" VALUES ('cmmm2smdx0016s0oj0pc5xhww', 'cmmm2smdq0015s0ojlba0g82r', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 75000, 0, 75000, 'PAID', 'T-TRX-1773235771981-92461', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:31.981', NULL, '2026-02-20 13:29:31.981', '2026-03-11 13:29:31.989');
INSERT INTO public."Payment" VALUES ('cmmm2sme10018s0ojtm8m66yg', 'cmmm2smdz0017s0oj7ngoeesd', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235771990-92500', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-21 13:29:31.99', NULL, '2026-02-21 13:29:31.99', '2026-03-11 13:29:31.993');
INSERT INTO public."Payment" VALUES ('cmmm2smel001as0ojdvlilht4', 'cmmm2sme40019s0ojscekwvd9', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235771995-66594', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-04 13:29:31.995', NULL, '2026-03-04 13:29:31.995', '2026-03-11 13:29:32.013');
INSERT INTO public."Payment" VALUES ('cmmm2smew001cs0ojwx10xjpj', 'cmmm2smer001bs0ojfvqrg4mp', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772018-2369', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-10 13:29:32.018', NULL, '2026-02-10 13:29:32.018', '2026-03-11 13:29:32.024');
INSERT INTO public."Payment" VALUES ('cmmm2smfn001es0ojdtljbb8g', 'cmmm2smfh001ds0ojaun9ir2o', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772040-34649', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:32.04', NULL, '2026-03-09 13:29:32.04', '2026-03-11 13:29:32.051');
INSERT INTO public."Payment" VALUES ('cmmm2smge001gs0oji00d6tst', 'cmmm2smfx001fs0ojymktutl8', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 63000, 0, 63000, 'PAID', 'T-TRX-1773235772061-76103', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 13:29:32.061', NULL, '2026-02-13 13:29:32.061', '2026-03-11 13:29:32.078');
INSERT INTO public."Payment" VALUES ('cmmm2smgr001is0ojfny4s4ql', 'cmmm2smgi001hs0ojuj0rhebc', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772081-31797', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 13:29:32.081', NULL, '2026-02-12 13:29:32.081', '2026-03-11 13:29:32.09');
INSERT INTO public."Payment" VALUES ('cmmm2smh5001ks0ojqv3rru33', 'cmmm2smgy001js0oj01ztqik8', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772096-9669', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-01 13:29:32.096', NULL, '2026-03-01 13:29:32.096', '2026-03-11 13:29:32.105');
INSERT INTO public."Payment" VALUES ('cmmm2smhf001ms0ojywnei4a0', 'cmmm2smha001ls0oj1mpkkhxn', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772109-39355', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.109', NULL, '2026-02-20 13:29:32.109', '2026-03-11 13:29:32.115');
INSERT INTO public."Payment" VALUES ('cmmm2smhk001os0ojnr1nshk3', 'cmmm2smhh001ns0ojz74wfzk1', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 15500, 0, 15500, 'PAID', 'T-TRX-1773235772116-57868', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.116', NULL, '2026-02-20 13:29:32.116', '2026-03-11 13:29:32.12');
INSERT INTO public."Payment" VALUES ('cmmm2smmm001qs0ojh4zvr5cd', 'cmmm2smhm001ps0ojr5vmnxeu', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772121-55724', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-01 13:29:32.121', NULL, '2026-03-01 13:29:32.121', '2026-03-11 13:29:32.302');
INSERT INTO public."Payment" VALUES ('cmmm2smn2001ss0ojoxpeqlgz', 'cmmm2smmo001rs0ojxnz7hsmv', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772304-78737', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-18 13:29:32.304', NULL, '2026-02-18 13:29:32.304', '2026-03-11 13:29:32.318');
INSERT INTO public."Payment" VALUES ('cmmm2smn7001us0oj2ye153vx', 'cmmm2smn4001ts0ojq4n2zpga', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772320-65164', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-10 13:29:32.32', NULL, '2026-03-10 13:29:32.32', '2026-03-11 13:29:32.323');
INSERT INTO public."Payment" VALUES ('cmmm2smnb001ws0oj0pw96ef9', 'cmmm2smn9001vs0ojr6thzq6j', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772325-48485', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-28 13:29:32.324', NULL, '2026-02-28 13:29:32.324', '2026-03-11 13:29:32.327');
INSERT INTO public."Payment" VALUES ('cmmm2smnf001ys0oj09pivot9', 'cmmm2smnd001xs0ojn9y2pl7e', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 75000, 0, 75000, 'PAID', 'T-TRX-1773235772329-3319', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-26 13:29:32.329', NULL, '2026-02-26 13:29:32.329', '2026-03-11 13:29:32.331');
INSERT INTO public."Payment" VALUES ('cmmm2smnj0020s0ojcgddlhq5', 'cmmm2smnh001zs0ojf669napy', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772333-48229', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-22 13:29:32.333', NULL, '2026-02-22 13:29:32.333', '2026-03-11 13:29:32.335');
INSERT INTO public."Payment" VALUES ('cmmm2smnq0022s0ojcgvmsbx5', 'cmmm2smnl0021s0ojuyudujnw', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772337-88353', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-14 13:29:32.336', NULL, '2026-02-14 13:29:32.336', '2026-03-11 13:29:32.342');
INSERT INTO public."Payment" VALUES ('cmmm2smnu0024s0ojvk2uinwp', 'cmmm2smns0023s0ojgszb8shk', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772343-27244', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-16 13:29:32.343', NULL, '2026-02-16 13:29:32.343', '2026-03-11 13:29:32.346');
INSERT INTO public."Payment" VALUES ('cmmm2smny0026s0ojgqv6roym', 'cmmm2smnw0025s0ojeqsrase9', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235772347-86227', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 13:29:32.347', NULL, '2026-03-05 13:29:32.347', '2026-03-11 13:29:32.35');
INSERT INTO public."Payment" VALUES ('cmmm2smoa0028s0oj41f7qw3p', 'cmmm2smo80027s0oji8h3f9vo', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772360-51274', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-16 13:29:32.36', NULL, '2026-02-16 13:29:32.36', '2026-03-11 13:29:32.362');
INSERT INTO public."Payment" VALUES ('cmmm2smoh002as0ojdbuwt73l', 'cmmm2smof0029s0ojuge33bhn', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772367-58717', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-19 13:29:32.367', NULL, '2026-02-19 13:29:32.367', '2026-03-11 13:29:32.369');
INSERT INTO public."Payment" VALUES ('cmmm2smoq002cs0oja2skhapd', 'cmmm2smoo002bs0ojbajjftr9', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1t0006s0oj6pbhhu4x', 'TRIPAY_QRIS', 75000, 0, 75000, 'PAID', 'T-TRX-1773235772376-5353', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-06 13:29:32.375', NULL, '2026-03-06 13:29:32.375', '2026-03-11 13:29:32.378');
INSERT INTO public."Payment" VALUES ('cmmm2smow002es0oj5x05w3va', 'cmmm2smos002ds0oj030jk27c', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235772379-86640', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 13:29:32.379', NULL, '2026-02-12 13:29:32.379', '2026-03-11 13:29:32.383');
INSERT INTO public."Payment" VALUES ('cmmm2smp0002gs0ojs3um6z5p', 'cmmm2smox002fs0ojfux5i6o7', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772385-23732', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-05 13:29:32.385', NULL, '2026-03-05 13:29:32.385', '2026-03-11 13:29:32.388');
INSERT INTO public."Payment" VALUES ('cmmm2smp5002is0ojgeey75u7', 'cmmm2smp2002hs0oju37w9qaw', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235772390-48285', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 13:29:32.39', NULL, '2026-03-09 13:29:32.39', '2026-03-11 13:29:32.393');
INSERT INTO public."Payment" VALUES ('cmmm2smpa002ks0oj83a2s7l9', 'cmmm2smp7002js0ojonma3i93', 'cmmm2sm2b0009s0oj6cgli5sx', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772395-98314', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-18 13:29:32.395', NULL, '2026-02-18 13:29:32.395', '2026-03-11 13:29:32.398');
INSERT INTO public."Payment" VALUES ('cmmm2smpf002ms0ojzfffr2id', 'cmmm2smpb002ls0ojexntg8d2', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235772399-33220', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-23 13:29:32.399', NULL, '2026-02-23 13:29:32.399', '2026-03-11 13:29:32.403');
INSERT INTO public."Payment" VALUES ('cmmm2smpl002os0ojt3swor0x', 'cmmm2smpi002ns0ojbgkgnlty', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 15500, 0, 15500, 'PAID', 'T-TRX-1773235772405-65785', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 13:29:32.405', NULL, '2026-02-13 13:29:32.405', '2026-03-11 13:29:32.409');
INSERT INTO public."Payment" VALUES ('cmmm2smpw002qs0ojq5k9qqqw', 'cmmm2smpr002ps0ojn61gwqui', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 50000, 0, 50000, 'PAID', 'T-TRX-1773235772414-44386', NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-07 13:29:32.414', NULL, '2026-03-07 13:29:32.414', '2026-03-11 13:29:32.42');
INSERT INTO public."Payment" VALUES ('cmmm2smq5002ss0ojlb1frska', 'cmmm2smq2002rs0oj29t0ytqc', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1n0004s0ojnfss2jyl', 'TRIPAY_QRIS', 42000, 0, 42000, 'PAID', 'T-TRX-1773235772424-24773', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-15 13:29:32.423', NULL, '2026-02-15 13:29:32.423', '2026-03-11 13:29:32.429');
INSERT INTO public."Payment" VALUES ('cmmm2smqa002us0ojou521920', 'cmmm2smq7002ts0ojqpmx41n1', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm1d0002s0oj6tqybwez', 'TRIPAY_QRIS', 20000, 0, 20000, 'PAID', 'T-TRX-1773235772431-72097', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 13:29:32.431', NULL, '2026-02-20 13:29:32.431', '2026-03-11 13:29:32.434');
INSERT INTO public."Payment" VALUES ('cmmm2smqe002ws0ojbru1m54h', 'cmmm2smqc002vs0oj9a3qz1m3', 'cmmm2sm2j000as0oj7yahs01t', 'cmmm2sm210008s0ojva03vmec', 'TRIPAY_QRIS', 21500, 0, 21500, 'PAID', 'T-TRX-1773235772436-63699', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-22 13:29:32.436', NULL, '2026-02-22 13:29:32.436', '2026-03-11 13:29:32.438');


--
-- TOC entry 4630 (class 0 OID 245001)
-- Dependencies: 245
-- Data for Name: PaymentChannel; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4622 (class 0 OID 244863)
-- Dependencies: 237
-- Data for Name: PlanTierMapping; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PlanTierMapping" VALUES ('cmmkd49vm0000naojo2lqzuu6', 'FREE', 'NORMAL', true, 'system_sync', '2026-03-10 08:42:59.334');
INSERT INTO public."PlanTierMapping" VALUES ('cmmkd49wd0001naoj5f7vpz8h', 'PRO', 'PRO', true, 'system_sync', '2026-03-10 08:42:59.482');
INSERT INTO public."PlanTierMapping" VALUES ('cmmkd49wv0002naojsic6gbiq', 'LEGEND', 'LEGEND', true, 'system_sync', '2026-03-10 08:42:59.5');
INSERT INTO public."PlanTierMapping" VALUES ('cmmkd49x20003naojq8tdpv2t', 'SUPREME', 'SUPREME', true, 'system_sync', '2026-03-10 08:42:59.509');


--
-- TOC entry 4655 (class 0 OID 245431)
-- Dependencies: 270
-- Data for Name: PopupPromo; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4618 (class 0 OID 244760)
-- Dependencies: 233
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Product" VALUES ('cmmm2sm3f000fs0ojzisrn84x', 'Mobile Legends Diamonds', 'mlbb-diamonds', 'cmmm2sm2x000bs0ojja9nia89', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ml.png', NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:29:31.611', '2026-03-11 13:29:31.611');
INSERT INTO public."Product" VALUES ('cmmm2sm3m000gs0ojov9bjywk', 'Free Fire Diamonds', 'free-fire-diamonds', 'cmmm2sm32000cs0oj43tlavlc', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-ff.png', NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:29:31.618', '2026-03-11 13:29:31.618');
INSERT INTO public."Product" VALUES ('cmmm2sm3t000hs0ojmeldqlza', 'Genshin Impact Genesis Crystals', 'genshin-cristals', 'cmmm2sm34000ds0ojezz4g7oc', NULL, 'https://cdn.unipin.com/images/icon_product_channels/1592285005-icon-genshin.png', NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:29:31.625', '2026-03-11 13:29:31.625');
INSERT INTO public."Product" VALUES ('cmmm37vxa000401lb0ujojon5', 'Blood Strike Topup', 'blood-strike-topup', 'cmmm37vvg000301lby0gqe5uu', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:24.168', '2026-03-11 13:41:24.168');
INSERT INTO public."Product" VALUES ('cmmm37w0m000701lbmxnwl4kr', 'Call of Duty MOBILE Topup', 'call-of-duty-mobile-topup', 'cmmm37vzq000601lbkdiihpsf', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:24.297', '2026-03-11 13:41:24.297');
INSERT INTO public."Product" VALUES ('cmmm37wam000g01lbnrfp6ao6', 'League of Legends PC Topup', 'league-of-legends-pc-topup', 'cmmm37wa7000f01lbukqhxana', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:24.666', '2026-03-11 13:41:24.666');
INSERT INTO public."Product" VALUES ('cmmm37wg7000n01lblbok9kwi', 'FREE FIRE Topup', 'free-fire-topup', 'cmmm2sm32000cs0oj43tlavlc', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:24.868', '2026-03-11 13:41:24.868');
INSERT INTO public."Product" VALUES ('cmmm37wrx000y01lbwe1ulqbp', 'ARENA OF VALOR Topup', 'arena-of-valor-topup', 'cmmm37wrj000x01lbb7zsyzb5', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:25.288', '2026-03-11 13:41:25.288');
INSERT INTO public."Product" VALUES ('cmmm37x1n001b01lbkpv426g1', 'Bleach Soul Resonance Topup', 'bleach-soul-resonance-topup', 'cmmm37x1d001a01lbdw8rz8ac', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:25.64', '2026-03-11 13:41:25.64');
INSERT INTO public."Product" VALUES ('cmmm37xdj001s01lb2bt88rtb', 'Genshin Impact Topup', 'genshin-impact-topup', 'cmmm2sm34000ds0ojezz4g7oc', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.067', '2026-03-11 13:41:26.067');
INSERT INTO public."Product" VALUES ('cmmm37xgy001y01lb90kzbyq5', 'MOBILE LEGENDS Topup', 'mobile-legends-topup', 'cmmm2sm2x000bs0ojja9nia89', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.191', '2026-03-11 13:41:26.191');
INSERT INTO public."Product" VALUES ('cmmm37xi1002101lbe371n7qx', 'Crossfire Topup', 'crossfire-topup', 'cmmm37xhl002001lbaryjxlx3', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.229', '2026-03-11 13:41:26.229');
INSERT INTO public."Product" VALUES ('cmmm37xv9002h01lbgfiwg0uz', 'Dragon City Topup', 'dragon-city-topup', 'cmmm37xv0002g01lbquetk3sf', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.705', '2026-03-11 13:41:26.705');
INSERT INTO public."Product" VALUES ('cmmm37y16002q01lbalbhvot4', 'PUBG MOBILE Topup', 'pubg-mobile-topup', 'cmmm37y0x002p01lbkso0xmh9', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.919', '2026-03-11 13:41:26.919');
INSERT INTO public."Product" VALUES ('cmmm37y1t002t01lbdcz0fgs2', 'Delta Force Topup', 'delta-force-topup', 'cmmm37y1l002s01lbmat8q2sv', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:26.942', '2026-03-11 13:41:26.942');
INSERT INTO public."Product" VALUES ('cmmm37y9m003001lbn0pwccoo', 'GARENA Topup', 'garena-topup', 'cmmm37y9e002z01lbga16tuvh', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:27.223', '2026-03-11 13:41:27.223');
INSERT INTO public."Product" VALUES ('cmmm37ye3003901lb2cn80cnv', 'TELKOMSEL Topup', 'telkomsel-topup', 'cmmm37ydt003801lbannm2sc2', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:27.383', '2026-03-11 13:41:27.383');
INSERT INTO public."Product" VALUES ('cmmm37yg9003e01lbpdl38yb7', 'Revelation Infinite Journey Topup', 'revelation-infinite-journey-topup', 'cmmm37yfz003d01lbs1k1zhhn', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:27.462', '2026-03-11 13:41:27.462');
INSERT INTO public."Product" VALUES ('cmmm37ykx003n01lbfihsg10e', 'Free Fire Max Topup', 'free-fire-max-topup', 'cmmm37ykm003m01lbt1f7ln1f', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:27.628', '2026-03-11 13:41:27.628');
INSERT INTO public."Product" VALUES ('cmmm37yxv004801lb2hnddoxk', 'FC Mobile Topup', 'fc-mobile-topup', 'cmmm37yxl004701lb35357bs0', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:28.095', '2026-03-11 13:41:28.095');
INSERT INTO public."Product" VALUES ('cmmm380bl006901lb4yw974v7', 'Haikyu Fly High Topup', 'haikyu-fly-high-topup', 'cmmm380bb006801lbalthnall', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:29.885', '2026-03-11 13:41:29.885');
INSERT INTO public."Product" VALUES ('cmmm380fj006h01lbs930yqtt', 'Honor of Kings Topup', 'honor-of-kings-topup', 'cmmm380f8006g01lbr0u8hpes', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:30.026', '2026-03-11 13:41:30.026');
INSERT INTO public."Product" VALUES ('cmmm380n7006v01lbv689bvzj', 'Honkai Impact 3 Topup', 'honkai-impact-3-topup', 'cmmm380mz006u01lb2ivd6sqi', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:30.305', '2026-03-11 13:41:30.305');
INSERT INTO public."Product" VALUES ('cmmm380pq007101lbnogsgqy1', 'Honkai Star Rail Topup', 'honkai-star-rail-topup', 'cmmm380pi007001lbwekt0qa4', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:30.395', '2026-03-11 13:41:30.395');
INSERT INTO public."Product" VALUES ('cmmm3811s007g01lbxa353ey1', 'League of Legends Wild Rift Topup', 'league-of-legends-wild-rift-topup', 'cmmm3811k007f01lbue0qzvik', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:30.829', '2026-03-11 13:41:30.829');
INSERT INTO public."Product" VALUES ('cmmm381qu008d01lbpa9v467o', 'Lords Mobile Topup', 'lords-mobile-topup', 'cmmm381qk008c01lbxnp5mqb4', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:31.731', '2026-03-11 13:41:31.731');
INSERT INTO public."Product" VALUES ('cmmm381yo008p01lbqex62x3g', 'Magic Chess Topup', 'magic-chess-topup', 'cmmm381yf008o01lbfpuz89lo', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:32.012', '2026-03-11 13:41:32.012');
INSERT INTO public."Product" VALUES ('cmmm3835e00an01lbqfzjacy6', 'Mobile Legends Adventure Topup', 'mobile-legends-adventure-topup', 'cmmm3835700am01lbqora1qup', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:33.552', '2026-03-11 13:41:33.552');
INSERT INTO public."Product" VALUES ('cmmm383fp00b601lb5ff26y1b', 'One Punch Man Topup', 'one-punch-man-topup', 'cmmm383fi00b501lbi1amg0ni', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:33.923', '2026-03-11 13:41:33.923');
INSERT INTO public."Product" VALUES ('cmmm383u200br01lbf3d65ofm', 'POINT BLANK Topup', 'point-blank-topup', 'cmmm383tv00bq01lbpkfpagya', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:34.439', '2026-03-11 13:41:34.439');
INSERT INTO public."Product" VALUES ('cmmm3842000c501lbr5duwn0a', 'Pokemon Unite Topup', 'pokemon-unite-topup', 'cmmm3841t00c401lbxaq5b80x', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:34.726', '2026-03-11 13:41:34.726');
INSERT INTO public."Product" VALUES ('cmmm3856n00cz01lbz7xx20n5', 'Ragnarok Origin Topup', 'ragnarok-origin-topup', 'cmmm3856c00cy01lbro1dtalv', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:36.187', '2026-03-11 13:41:36.187');
INSERT INTO public."Product" VALUES ('cmmm3859i00d501lb1yp7w52d', 'Ragnarok Twilight Topup', 'ragnarok-twilight-topup', 'cmmm3859900d401lbhc7j6l68', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:36.29', '2026-03-11 13:41:36.29');
INSERT INTO public."Product" VALUES ('cmmm385h300di01lbxumdtnk3', 'Sausage Man Topup', 'sausage-man-topup', 'cmmm385go00dh01lbq4q8s20q', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:36.558', '2026-03-11 13:41:36.558');
INSERT INTO public."Product" VALUES ('cmmm385xl00e301lbuj1xf23w', 'State of Survival Topup', 'state-of-survival-topup', 'cmmm385x500e201lbxo3lnen4', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:37.158', '2026-03-11 13:41:37.158');
INSERT INTO public."Product" VALUES ('cmmm3864u00ee01lb77kes8tx', 'Stumble Guys Topup', 'stumble-guys-topup', 'cmmm3864f00ed01lb526xrph4', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:37.418', '2026-03-11 13:41:37.418');
INSERT INTO public."Product" VALUES ('cmmm386aj00ek01lbdd64wqlu', 'Valorant Topup', 'valorant-topup', 'cmmm3869z00ej01lbcxgt45ak', NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, 'ACTIVE', 0, false, false, '2026-03-11 13:41:37.622', '2026-03-11 13:41:37.622');


--
-- TOC entry 4660 (class 0 OID 245510)
-- Dependencies: 275
-- Data for Name: ProductReview; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4647 (class 0 OID 245307)
-- Dependencies: 262
-- Data for Name: ProductSalesStats; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4619 (class 0 OID 244784)
-- Dependencies: 234
-- Data for Name: ProductSku; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000is0ojok5nzrrg', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm38000es0ojpyl0zxwk', '86 Diamonds', 'ML86', NULL, NULL, 19500, 21500, 20500, 20000, 19800, 2000, 1000, 500, 300, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000js0oj0spk8b41', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm38000es0ojpyl0zxwk', '172 Diamonds', 'ML172', NULL, NULL, 38000, 42000, 40000, 39000, 38500, 4000, 2000, 1000, 500, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000ks0oj7ie6amsz', 'cmmm2sm3f000fs0ojzisrn84x', 'cmmm2sm38000es0ojpyl0zxwk', '257 Diamonds', 'ML257', NULL, NULL, 57000, 63000, 60000, 58500, 57800, 6000, 3000, 1500, 800, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000ls0ojp0suua0t', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm38000es0ojpyl0zxwk', '140 Diamonds', 'FF140', NULL, NULL, 18000, 20000, 19000, 18500, 18200, 2000, 1000, 500, 200, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000ms0ojiir2idm8', 'cmmm2sm3m000gs0ojov9bjywk', 'cmmm2sm38000es0ojpyl0zxwk', '355 Diamonds', 'FF355', NULL, NULL, 45000, 50000, 48000, 46500, 45800, 5000, 3000, 1500, 800, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000ns0ojpezhxk5g', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm38000es0ojpyl0zxwk', '60 Genesis Crystals', 'GNR60', NULL, NULL, 13500, 15500, 14500, 14000, 13800, 2000, 1000, 500, 300, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm2sm45000os0oj5vq0v6wu', 'cmmm2sm3t000hs0ojmeldqlza', 'cmmm2sm38000es0ojpyl0zxwk', 'Blessing of the Welkin Moon', 'GNW', NULL, NULL, 65000, 75000, 70000, 68000, 66000, 10000, 5000, 3000, 1000, 999, 'ACTIVE', 0, NULL, '2026-03-11 13:29:31.635', '2026-03-11 13:29:31.635');
INSERT INTO public."ProductSku" VALUES ('cmmm37vz1000501lbboqi5kgh', 'cmmm37vxa000401lb0ujojon5', 'cmmm2sm38000es0ojpyl0zxwk', 'Blood Strike 100 Gold', '100gold', NULL, NULL, 12600, 14113, 13608, 13230, 12978, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.253', '2026-03-11 13:41:24.253');
INSERT INTO public."ProductSku" VALUES ('cmmm37w28000801lb9dld8wzu', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 1056 CP', '1056', NULL, NULL, 182025, 203869, 196587, 191127, 187486, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.368', '2026-03-11 13:41:24.368');
INSERT INTO public."ProductSku" VALUES ('cmmm37w44000901lbo5z98juu', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 10560 CP', '10560', NULL, NULL, 1820025, 2038429, 1965628, 1911027, 1874626, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.436', '2026-03-11 13:41:24.436');
INSERT INTO public."ProductSku" VALUES ('cmmm37w5v000a01lb8sxzqk28', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 106 CP', '106', NULL, NULL, 18210, 20396, 19667, 19121, 18757, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.499', '2026-03-11 13:41:24.499');
INSERT INTO public."ProductSku" VALUES ('cmmm37w6y000b01lb1v2yf1ik', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 112 CP', '112', NULL, NULL, 18875, 21141, 20385, 19819, 19442, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.538', '2026-03-11 13:41:24.538');
INSERT INTO public."ProductSku" VALUES ('cmmm37w7p000c01lbmukop0rh', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 127 CP', '127', NULL, NULL, 17980, 20138, 19419, 18879, 18520, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.565', '2026-03-11 13:41:24.565');
INSERT INTO public."ProductSku" VALUES ('cmmm37w8u000d01lbfur6rqn7', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 128 CP', '128', NULL, NULL, 18111, 20285, 19560, 19017, 18655, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.606', '2026-03-11 13:41:24.606');
INSERT INTO public."ProductSku" VALUES ('cmmm37w9u000e01lbtw6mpy4y', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 1584 CP', '1584', NULL, NULL, 285350, 319593, 308178, 299618, 293911, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.641', '2026-03-11 13:41:24.641');
INSERT INTO public."ProductSku" VALUES ('cmmm37wax000h01lb2nvbl8lp', 'cmmm37wam000g01lbnrfp6ao6', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends 185 RP', '180', NULL, NULL, 13950, 15625, 15067, 14648, 14369, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.681', '2026-03-11 13:41:24.681');
INSERT INTO public."ProductSku" VALUES ('cmmm37wby000i01lbf47q3qam', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 264 CP', '264', NULL, NULL, 47875, 53621, 51705, 50269, 49312, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.718', '2026-03-11 13:41:24.718');
INSERT INTO public."ProductSku" VALUES ('cmmm37wcw000j01lbg6zdxqf8', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 2640 CP', '2640', NULL, NULL, 455025, 509629, 491428, 477777, 468676, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.751', '2026-03-11 13:41:24.751');
INSERT INTO public."ProductSku" VALUES ('cmmm37wdv000k01lbwa7a5sk2', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 26400 CP', '26400', NULL, NULL, 4541250, 5086201, 4904550, 4768313, 4677488, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.787', '2026-03-11 13:41:24.787');
INSERT INTO public."ProductSku" VALUES ('cmmm37wew000l01lbvfqhbzy3', 'cmmm37vxa000401lb0ujojon5', 'cmmm2sm38000es0ojpyl0zxwk', 'Blood Strike 300 Gold', '300gold', NULL, NULL, 37800, 42337, 40824, 39690, 38934, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.824', '2026-03-11 13:41:24.824');
INSERT INTO public."ProductSku" VALUES ('cmmm37wfo000m01lbhj88ckpa', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 31 CP', '31', NULL, NULL, 4900, 5489, 5292, 5145, 5047, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.852', '2026-03-11 13:41:24.852');
INSERT INTO public."ProductSku" VALUES ('cmmm37wgi000o01lbmo7ua0kr', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 4050 Diamond', '4050', NULL, NULL, 510114, 571328, 550924, 535620, 525418, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.882', '2026-03-11 13:41:24.882');
INSERT INTO public."ProductSku" VALUES ('cmmm37whm000p01lbj1cbnqmh', 'cmmm37vxa000401lb0ujojon5', 'cmmm2sm38000es0ojpyl0zxwk', 'Blood Strike 500 Gold', '500gold', NULL, NULL, 63000, 70560, 68040, 66150, 64890, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:24.922', '2026-03-11 13:41:24.922');
INSERT INTO public."ProductSku" VALUES ('cmmm37wiy000q01lb7me08irj', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 528 CP', '528', NULL, NULL, 91025, 101949, 98307, 95577, 93756, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:24.969', '2026-03-11 13:41:24.969');
INSERT INTO public."ProductSku" VALUES ('cmmm37wjs000r01lbnap2sq10', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 5280 CP', '5280', NULL, NULL, 910025, 1019229, 982828, 955527, 937326, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25', '2026-03-11 13:41:25');
INSERT INTO public."ProductSku" VALUES ('cmmm37wm3000s01lb5a81673t', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 52800 CP', '52800', NULL, NULL, 9100025, 10192029, 9828027, 9555027, 9373026, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.083', '2026-03-11 13:41:25.083');
INSERT INTO public."ProductSku" VALUES ('cmmm37woq000t01lbuk8ucjd6', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 53 CP', '53', NULL, NULL, 9105, 10198, 9834, 9561, 9379, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.177', '2026-03-11 13:41:25.177');
INSERT INTO public."ProductSku" VALUES ('cmmm37wpf000u01lb1et87gpf', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 63 CP', '63CP', NULL, NULL, 8800, 9857, 9504, 9240, 9064, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:25.202', '2026-03-11 13:41:25.202');
INSERT INTO public."ProductSku" VALUES ('cmmm37wqd000v01lbircp3l16', 'cmmm37wam000g01lbnrfp6ao6', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends 750 RP', '750', NULL, NULL, 53809, 60267, 58114, 56500, 55424, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:25.236', '2026-03-11 13:41:25.236');
INSERT INTO public."ProductSku" VALUES ('cmmm37wra000w01lb8ue885m2', 'cmmm37w0m000701lbmxnwl4kr', 'cmmm2sm38000es0ojpyl0zxwk', 'Call of Duty Mobile 76560 CP', '76560', NULL, NULL, 9100025, 10192029, 9828027, 9555027, 9373026, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.27', '2026-03-11 13:41:25.27');
INSERT INTO public."ProductSku" VALUES ('cmmm37ws9000z01lbpmrlcvr9', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 1430 Vouchers', 'aov-1430vcr', NULL, NULL, 272615, 305329, 294425, 286246, 280794, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:25.305', '2026-03-11 13:41:25.305');
INSERT INTO public."ProductSku" VALUES ('cmmm37wt3001001lbyvjrr7or', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 18 Vouchers', 'aov-18vcr', NULL, NULL, 6455, 7230, 6972, 6778, 6649, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.335', '2026-03-11 13:41:25.335');
INSERT INTO public."ProductSku" VALUES ('cmmm37wua001101lbrpmy5qmr', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 230 Vouchers', 'aov-230vcr', NULL, NULL, 46825, 52445, 50571, 49167, 48230, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.378', '2026-03-11 13:41:25.378');
INSERT INTO public."ProductSku" VALUES ('cmmm37wvb001201lbtl2gbfqz', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 2390 Vouchers', 'aov-2390vcr', NULL, NULL, 450579, 504649, 486626, 473108, 464097, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.415', '2026-03-11 13:41:25.415');
INSERT INTO public."ProductSku" VALUES ('cmmm37ww0001301lbi7agm6ic', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 24050 Vouchers', 'aov-24050vcr', NULL, NULL, 4751600, 5321793, 5131728, 4989180, 4894148, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.44', '2026-03-11 13:41:25.44');
INSERT INTO public."ProductSku" VALUES ('cmmm37wxy001501lb6lr5khfm', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 470 Vouchers', 'aov-470vcr', NULL, NULL, 89785, 100560, 96968, 94275, 92479, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:25.51', '2026-03-11 13:41:25.51');
INSERT INTO public."ProductSku" VALUES ('cmmm37wys001601lb2ka5m4on', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 4800 Vouchers', 'aov-4800', NULL, NULL, 841996, 943036, 909356, 884096, 867256, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.54', '2026-03-11 13:41:25.54');
INSERT INTO public."ProductSku" VALUES ('cmmm37wzo001701lbv2ijlpsr', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 48200 Vouchers', 'aov-48200vcr', NULL, NULL, 9503100, 10643473, 10263348, 9978255, 9788193, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.572', '2026-03-11 13:41:25.572');
INSERT INTO public."ProductSku" VALUES ('cmmm37x0i001801lb3i8mdknx', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 7 Vouchers', 'aov-7vcr', NULL, NULL, 2245, 2515, 2425, 2358, 2313, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.602', '2026-03-11 13:41:25.602');
INSERT INTO public."ProductSku" VALUES ('cmmm37x16001901lb0ggiarc0', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire BP Card', 'bp-1', NULL, NULL, 41389, 46356, 44701, 43459, 42631, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.626', '2026-03-11 13:41:25.626');
INSERT INTO public."ProductSku" VALUES ('cmmm37x1w001c01lb9qbswxbc', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 12800', 'bs-12800', NULL, NULL, 2747440, 3077133, 2967236, 2884812, 2829864, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.652', '2026-03-11 13:41:25.652');
INSERT INTO public."ProductSku" VALUES ('cmmm37x34001d01lbp6qt5ubs', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 1980', 'bs-1980', NULL, NULL, 431540, 483325, 466064, 453117, 444487, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.696', '2026-03-11 13:41:25.696');
INSERT INTO public."ProductSku" VALUES ('cmmm37x41001e01lba9dvpywr', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 300', 'bs-300', NULL, NULL, 71888, 80515, 77640, 75483, 74045, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.729', '2026-03-11 13:41:25.729');
INSERT INTO public."ProductSku" VALUES ('cmmm37x4p001f01lbal5wsjkp', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 3280', 'bs-3280', NULL, NULL, 725973, 813090, 784051, 762272, 747753, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.753', '2026-03-11 13:41:25.753');
INSERT INTO public."ProductSku" VALUES ('cmmm37x5b001g01lbc05in54v', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 32800', 'bs-32800', NULL, NULL, 6868563, 7692791, 7418049, 7211992, 7074620, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.775', '2026-03-11 13:41:25.775');
INSERT INTO public."ProductSku" VALUES ('cmmm37x5y001h01lbp5w1tnvv', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 60', 'bs-60', NULL, NULL, 14688, 16451, 15864, 15423, 15129, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.798', '2026-03-11 13:41:25.798');
INSERT INTO public."ProductSku" VALUES ('cmmm37x6l001i01lbs2u7igjq', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 6480', 'bs-6480', NULL, NULL, 1424628, 1595584, 1538599, 1495860, 1467367, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.821', '2026-03-11 13:41:25.821');
INSERT INTO public."ProductSku" VALUES ('cmmm37x7a001j01lbo408chv0', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Spiritual Jade 980', 'bs-980', NULL, NULL, 228123, 255498, 246373, 239530, 234967, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.846', '2026-03-11 13:41:25.846');
INSERT INTO public."ProductSku" VALUES ('cmmm37x7y001k01lbwk8dv0ic', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Iceworld Journey Pack', 'bsr-1', NULL, NULL, 14164, 15864, 15298, 14873, 14589, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.87', '2026-03-11 13:41:25.87');
INSERT INTO public."ProductSku" VALUES ('cmmm37x8l001l01lbacj17qic', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Monthly Card Membership', 'bsr-2', NULL, NULL, 70513, 78975, 76155, 74039, 72629, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.893', '2026-03-11 13:41:25.893');
INSERT INTO public."ProductSku" VALUES ('cmmm37x98001m01lbllo6k6bk', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Selected Monthly Voucher', 'bsr-3', NULL, NULL, 70513, 78975, 76155, 74039, 72629, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.916', '2026-03-11 13:41:25.916');
INSERT INTO public."ProductSku" VALUES ('cmmm37x9v001n01lb0hj9bp8g', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Limited Summoning Box', 'bsr-4', NULL, NULL, 141661, 158661, 152994, 148745, 145911, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.939', '2026-03-11 13:41:25.939');
INSERT INTO public."ProductSku" VALUES ('cmmm37xao001o01lbqpiq38b1', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Limited Assembly Box', 'bsr-5', NULL, NULL, 141561, 158549, 152886, 148640, 145808, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.968', '2026-03-11 13:41:25.968');
INSERT INTO public."ProductSku" VALUES ('cmmm37xbk001p01lbppeze48s', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Phase Training', 'bsr-6', NULL, NULL, 141001, 157922, 152282, 148052, 145232, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.999', '2026-03-11 13:41:25.999');
INSERT INTO public."ProductSku" VALUES ('cmmm37xcg001q01lb1tfjgoc9', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Extreme Training', 'bsr-7', NULL, NULL, 294557, 329904, 318122, 309285, 303394, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.032', '2026-03-11 13:41:26.032');
INSERT INTO public."ProductSku" VALUES ('cmmm37xd3001r01lbcqet2k3w', 'cmmm37x1n001b01lbkpv426g1', 'cmmm2sm38000es0ojpyl0zxwk', 'BLEACH Soul Resonance Premium Assembly Box', 'bsr-8', NULL, NULL, 344536, 385881, 372099, 361763, 354873, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.055', '2026-03-11 13:41:26.055');
INSERT INTO public."ProductSku" VALUES ('cmmm37xdt001t01lb9ugp4jl3', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact Blessing of the Welkin Moon', 'bw-1', NULL, NULL, 55995, 62715, 60475, 58795, 57675, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.081', '2026-03-11 13:41:26.081');
INSERT INTO public."ProductSku" VALUES ('cmmm37xel001u01lbd0353fdw', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact Blessing of the Welkin Moon 2x', 'bw-2', NULL, NULL, 109713, 122879, 118491, 115199, 113005, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.108', '2026-03-11 13:41:26.108');
INSERT INTO public."ProductSku" VALUES ('cmmm37xf8001v01lb9iv76p5x', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact Blessing of the Welkin Moon 3x', 'bw-3', NULL, NULL, 164557, 184304, 177722, 172785, 169494, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.132', '2026-03-11 13:41:26.132');
INSERT INTO public."ProductSku" VALUES ('cmmm37xfx001w01lbcyqmbqtr', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact Blessing of the Welkin Moon 4x', 'bw-4', NULL, NULL, 219401, 245730, 236954, 230372, 225984, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.157', '2026-03-11 13:41:26.157');
INSERT INTO public."ProductSku" VALUES ('cmmm37xgj001x01lbxye1rdz5', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact Blessing of the Welkin Moon 5x', 'bw-5', NULL, NULL, 274245, 307155, 296185, 287958, 282473, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.179', '2026-03-11 13:41:26.179');
INSERT INTO public."ProductSku" VALUES ('cmmm37xh8001z01lbth5h7yq6', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Cek Username', 'C-1', NULL, NULL, 5, 6, 6, 6, 6, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.204', '2026-03-11 13:41:26.204');
INSERT INTO public."ProductSku" VALUES ('cmmm37xia002201lbbe83ayjz', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 10 Coin', 'cfl-10', NULL, NULL, 2222, 2489, 2400, 2334, 2289, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.242', '2026-03-11 13:41:26.242');
INSERT INTO public."ProductSku" VALUES ('cmmm37xiz002301lb3t7m6p19', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 120 Coin', 'cfl-120', NULL, NULL, 26623, 29818, 28753, 27955, 27422, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.267', '2026-03-11 13:41:26.267');
INSERT INTO public."ProductSku" VALUES ('cmmm37xjs002401lbdfjoq5ez', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 1280 Coin', 'cfl-1280', NULL, NULL, 291717, 326724, 315055, 306303, 300469, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.296', '2026-03-11 13:41:26.296');
INSERT INTO public."ProductSku" VALUES ('cmmm37xke002501lb1fta08zm', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 180 Coin', 'cfl-180', NULL, NULL, 38149, 42727, 41201, 40057, 39294, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.318', '2026-03-11 13:41:26.318');
INSERT INTO public."ProductSku" VALUES ('cmmm37xl1002601lbagx9at5n', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 1980 Coin', 'cfl-1980', NULL, NULL, 424707, 475672, 458684, 445943, 437449, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.341', '2026-03-11 13:41:26.341');
INSERT INTO public."ProductSku" VALUES ('cmmm37xlr002701lbillhkyrh', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 2580 Coin', 'cfl-2580', NULL, NULL, 523120, 585895, 564970, 549276, 538814, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.367', '2026-03-11 13:41:26.367');
INSERT INTO public."ProductSku" VALUES ('cmmm37xmf002801lbc5oxya7t', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 30 Coin', 'cfl-30', NULL, NULL, 7240, 8109, 7820, 7602, 7458, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.391', '2026-03-11 13:41:26.391');
INSERT INTO public."ProductSku" VALUES ('cmmm37xn2002901lb7kp3w3kz', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 300 Coin', 'cfl-300', NULL, NULL, 70067, 78476, 75673, 73571, 72170, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.414', '2026-03-11 13:41:26.414');
INSERT INTO public."ProductSku" VALUES ('cmmm37xns002a01lbk6ihgcuk', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 3280 Coin', 'cfl-3280', NULL, NULL, 708419, 793430, 765093, 743840, 729672, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.44', '2026-03-11 13:41:26.44');
INSERT INTO public."ProductSku" VALUES ('cmmm37xok002b01lbckjcf1fy', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 4500 Coin', 'cfl-4500', NULL, NULL, 887714, 994240, 958732, 932100, 914346, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.468', '2026-03-11 13:41:26.468');
INSERT INTO public."ProductSku" VALUES ('cmmm37xql002c01lbqsjvtgjn', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 500 Coin', 'cfl-500', NULL, NULL, 105531, 118195, 113974, 110808, 108697, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.541', '2026-03-11 13:41:26.541');
INSERT INTO public."ProductSku" VALUES ('cmmm37xrj002d01lb9kkeaix8', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 60 Coin', 'cfl-60', NULL, NULL, 14932, 16724, 16127, 15679, 15380, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.575', '2026-03-11 13:41:26.575');
INSERT INTO public."ProductSku" VALUES ('cmmm37xu0002e01lbx4127pqa', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 6480 Coin', 'cfl-6480', NULL, NULL, 1417699, 1587823, 1531115, 1488584, 1460230, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.664', '2026-03-11 13:41:26.664');
INSERT INTO public."ProductSku" VALUES ('cmmm37xut002f01lbryapommx', 'cmmm37xi1002101lbe371n7qx', 'cmmm2sm38000es0ojpyl0zxwk', 'Crossfire Legends 680 Coin', 'cfl-680', NULL, NULL, 140995, 157915, 152275, 148045, 145225, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.693', '2026-03-11 13:41:26.693');
INSERT INTO public."ProductSku" VALUES ('cmmm37xvs002i01lby0q8si8h', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 140 Gems', 'dc-140', NULL, NULL, 90000, 100801, 97200, 94500, 92700, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.728', '2026-03-11 13:41:26.728');
INSERT INTO public."ProductSku" VALUES ('cmmm37xwu002j01lbaaa0rm8j', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 1700 Gems', 'dc-1700', NULL, NULL, 450000, 504001, 486001, 472500, 463500, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.766', '2026-03-11 13:41:26.766');
INSERT INTO public."ProductSku" VALUES ('cmmm37xxw002k01lb0wbxhis4', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 25 Gems', 'dc-25', NULL, NULL, 22500, 25201, 24300, 23625, 23175, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.804', '2026-03-11 13:41:26.804');
INSERT INTO public."ProductSku" VALUES ('cmmm37xyt002l01lbhuq8t45p', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 300 Gems', 'dc-300', NULL, NULL, 150000, 168001, 162000, 157500, 154500, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.837', '2026-03-11 13:41:26.837');
INSERT INTO public."ProductSku" VALUES ('cmmm37xzh002m01lbegc3deuo', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 465 Gems', 'dc-465', NULL, NULL, 225000, 252001, 243001, 236250, 231750, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.861', '2026-03-11 13:41:26.861');
INSERT INTO public."ProductSku" VALUES ('cmmm37y04002n01lblmv5i8mz', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 65 Gems', 'dc-65', NULL, NULL, 45000, 50401, 48600, 47250, 46350, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.884', '2026-03-11 13:41:26.884');
INSERT INTO public."ProductSku" VALUES ('cmmm37y0r002o01lbpnmo3j6z', 'cmmm37xv9002h01lbgfiwg0uz', 'cmmm2sm38000es0ojpyl0zxwk', 'Dragon City 800 Gems', 'dc-800', NULL, NULL, 350000, 392001, 378000, 367500, 360500, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.907', '2026-03-11 13:41:26.907');
INSERT INTO public."ProductSku" VALUES ('cmmm37y1f002r01lbaph5wisw', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 3500 UC', 'DF-1251', NULL, NULL, 722580, 809290, 780387, 758709, 744258, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.931', '2026-03-11 13:41:26.931');
INSERT INTO public."ProductSku" VALUES ('cmmm37y25002u01lbqlcygf1n', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 1.280 Delta Coins', 'df-1280', NULL, NULL, 248640, 278477, 268532, 261072, 256100, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:26.957', '2026-03-11 13:41:26.957');
INSERT INTO public."ProductSku" VALUES ('cmmm37y3f002v01lbd3paf2al', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 12.960 Delta Coins', 'df-12960', NULL, NULL, 2486078, 2784408, 2684965, 2610382, 2560661, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.002', '2026-03-11 13:41:27.002');
INSERT INTO public."ProductSku" VALUES ('cmmm37y4y002w01lbkeqvxxj4', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 1.680 Delta Coins', 'df-1680', NULL, NULL, 310868, 348173, 335738, 326412, 320195, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.058', '2026-03-11 13:41:27.058');
INSERT INTO public."ProductSku" VALUES ('cmmm37y63002x01lb3a97wq3z', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 18 Delta Coins', 'df-18', NULL, NULL, 3677, 4119, 3972, 3861, 3788, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.098', '2026-03-11 13:41:27.098');
INSERT INTO public."ProductSku" VALUES ('cmmm37y94002y01lbuo2enyyo', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 19.440 Delta Coins', 'df-19440', NULL, NULL, 3729104, 4176597, 4027433, 3915560, 3840978, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.208', '2026-03-11 13:41:27.208');
INSERT INTO public."ProductSku" VALUES ('cmmm37y9w003101lbt6opxhpk', 'cmmm37y9m003001lbn0pwccoo', 'cmmm2sm38000es0ojpyl0zxwk', 'Garena 330 Shell', 'DF-2525', NULL, NULL, 91475, 102453, 98793, 96049, 94220, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:27.236', '2026-03-11 13:41:27.236');
INSERT INTO public."ProductSku" VALUES ('cmmm37yah003201lbmsq3t2eq', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 30 Delta Coins', 'df-30', NULL, NULL, 6173, 6914, 6667, 6482, 6359, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.257', '2026-03-11 13:41:27.257');
INSERT INTO public."ProductSku" VALUES ('cmmm37yb3003301lb1t8jtkf1', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 300 Delta Coins', 'df-300', NULL, NULL, 62255, 69726, 67236, 65368, 64123, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.279', '2026-03-11 13:41:27.279');
INSERT INTO public."ProductSku" VALUES ('cmmm37ybo003401lbbo2h2tsq', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 3.280 Delta Coins', 'df-3280', NULL, NULL, 621539, 696124, 671263, 652616, 640186, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.3', '2026-03-11 13:41:27.3');
INSERT INTO public."ProductSku" VALUES ('cmmm37yca003501lbkrt1be4d', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 420 Delta Coins', 'df-420', NULL, NULL, 90131, 100947, 97342, 94638, 92835, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.321', '2026-03-11 13:41:27.321');
INSERT INTO public."ProductSku" VALUES ('cmmm37ycx003601lbsfakdft0', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 60 Delta Coins', 'df-60', NULL, NULL, 12405, 13894, 13398, 13026, 12778, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.345', '2026-03-11 13:41:27.345');
INSERT INTO public."ProductSku" VALUES ('cmmm37ydm003701lbqojv86gr', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 6.480 Delta Coins', 'df-6480', NULL, NULL, 1243052, 1392219, 1342497, 1305205, 1280344, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.37', '2026-03-11 13:41:27.37');
INSERT INTO public."ProductSku" VALUES ('cmmm37yeg003a01lbicmhgref', 'cmmm37ye3003901lb2cn80cnv', 'cmmm2sm38000es0ojpyl0zxwk', 'Telkomsel Data 1 GB + 2 GB Game / 30 Hari', 'DF-670', NULL, NULL, 22950, 25705, 24786, 24098, 23639, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:27.4', '2026-03-11 13:41:27.4');
INSERT INTO public."ProductSku" VALUES ('cmmm37yf6003b01lbzs75lu51', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force 680 Delta Coins', 'df-680', NULL, NULL, 124311, 139229, 134256, 130527, 128041, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.426', '2026-03-11 13:41:27.426');
INSERT INTO public."ProductSku" VALUES ('cmmm37yfs003c01lbj4s2vy5r', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 500 UC', 'DF-696', NULL, NULL, 89050, 99737, 96174, 93503, 91722, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:27.448', '2026-03-11 13:41:27.448');
INSERT INTO public."ProductSku" VALUES ('cmmm37ygj003f01lb3luvec6i', 'cmmm37yg9003e01lbpdl38yb7', 'cmmm2sm38000es0ojpyl0zxwk', 'Revelation Infinite Journey 40 + 6 Jade', 'DF-7557', NULL, NULL, 8500, 9520, 9180, 8925, 8755, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:27.475', '2026-03-11 13:41:27.475');
INSERT INTO public."ProductSku" VALUES ('cmmm37yha003g01lb123wurfq', 'cmmm37yg9003e01lbpdl38yb7', 'cmmm2sm38000es0ojpyl0zxwk', 'Revelation Infinite Journey 110 + 17 Jade', 'DF-7558', NULL, NULL, 21778, 24392, 23521, 22867, 22432, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.502', '2026-03-11 13:41:27.502');
INSERT INTO public."ProductSku" VALUES ('cmmm37yhv003h01lbpy61qiv8', 'cmmm37yg9003e01lbpdl38yb7', 'cmmm2sm38000es0ojpyl0zxwk', 'Revelation Infinite Journey 230 + 35 Jade', 'DF-7559', NULL, NULL, 43564, 48792, 47050, 45743, 44871, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.523', '2026-03-11 13:41:27.523');
INSERT INTO public."ProductSku" VALUES ('cmmm37yih003i01lbsiu86ilt', 'cmmm37yg9003e01lbpdl38yb7', 'cmmm2sm38000es0ojpyl0zxwk', 'Revelation Infinite Journey 460 + 49 Jade', 'DF-7560', NULL, NULL, 87077, 97527, 94044, 91431, 89690, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.545', '2026-03-11 13:41:27.545');
INSERT INTO public."ProductSku" VALUES ('cmmm37yj3003j01lbtpczemoc', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force Genesis Supplies', 'dfg-1', NULL, NULL, 7731, 8659, 8350, 8118, 7963, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.567', '2026-03-11 13:41:27.567');
INSERT INTO public."ProductSku" VALUES ('cmmm37yjt003k01lbv04rypt3', 'cmmm37y1t002t01lbdcz0fgs2', 'cmmm2sm38000es0ojpyl0zxwk', 'Delta Force Genesis Supplies - Advanced', 'dfg-2', NULL, NULL, 22085, 24736, 23852, 23190, 22748, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.593', '2026-03-11 13:41:27.593');
INSERT INTO public."ProductSku" VALUES ('cmmm37ykg003l01lbnvbhqabb', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'Pubg Elite Pass Plus', 'ep-1', NULL, NULL, 452371, 506656, 488561, 474990, 465943, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.616', '2026-03-11 13:41:27.616');
INSERT INTO public."ProductSku" VALUES ('cmmm37yl6003o01lb1gvlm61w', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 10 Diamonds', 'ffm-10', NULL, NULL, 1815, 2033, 1961, 1906, 1870, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.642', '2026-03-11 13:41:27.642');
INSERT INTO public."ProductSku" VALUES ('cmmm37ylu003p01lbfiod2hxh', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 100 Diamonds', 'ffm-100', NULL, NULL, 14480, 16218, 15639, 15204, 14915, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.666', '2026-03-11 13:41:27.666');
INSERT INTO public."ProductSku" VALUES ('cmmm37ymg003q01lb9znwj0rm', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 1.050 Diamonds', 'ffm-1050', NULL, NULL, 132211, 148077, 142788, 138822, 136178, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.688', '2026-03-11 13:41:27.688');
INSERT INTO public."ProductSku" VALUES ('cmmm37yna003r01lbuxafl66b', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 14.580 Diamonds', 'ffm-14580', NULL, NULL, 1674835, 1875816, 1808822, 1758577, 1725081, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.718', '2026-03-11 13:41:27.718');
INSERT INTO public."ProductSku" VALUES ('cmmm37ynv003s01lbaemlnw52', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 150 Diamonds', 'ffm-150', NULL, NULL, 19467, 21804, 21025, 20441, 20052, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.739', '2026-03-11 13:41:27.739');
INSERT INTO public."ProductSku" VALUES ('cmmm37yok003t01lbb14kajcw', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 1.580 Diamonds', 'ffm-1580', NULL, NULL, 195807, 219304, 211472, 205598, 201682, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.764', '2026-03-11 13:41:27.764');
INSERT INTO public."ProductSku" VALUES ('cmmm37yp9003u01lby5a00xjo', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 210 Diamonds', 'ffm-210', NULL, NULL, 27139, 30396, 29311, 28496, 27954, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.789', '2026-03-11 13:41:27.789');
INSERT INTO public."ProductSku" VALUES ('cmmm37ypv003v01lbchwb1ezb', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 2.140 Diamonds', 'ffm-2140', NULL, NULL, 269785, 302160, 291368, 283275, 277879, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.811', '2026-03-11 13:41:27.811');
INSERT INTO public."ProductSku" VALUES ('cmmm37yqi003w01lbzh0dvo24', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 25 Diamonds', 'ffm-25', NULL, NULL, 4530, 5074, 4893, 4757, 4666, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.834', '2026-03-11 13:41:27.834');
INSERT INTO public."ProductSku" VALUES ('cmmm37yr6003x01lbjng673rc', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 355 Diamonds', 'ffm-355', NULL, NULL, 44245, 49555, 47785, 46458, 45573, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.858', '2026-03-11 13:41:27.858');
INSERT INTO public."ProductSku" VALUES ('cmmm37yrt003y01lbdm7uhtsg', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 36.500 Diamonds', 'ffm-36500', NULL, NULL, 4400163, 4928183, 4752177, 4620172, 4532168, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.881', '2026-03-11 13:41:27.881');
INSERT INTO public."ProductSku" VALUES ('cmmm37ysg003z01lbf7o4xrki', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 420 Diamonds', 'ffm-420', NULL, NULL, 55190, 61813, 59606, 57950, 56846, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.904', '2026-03-11 13:41:27.904');
INSERT INTO public."ProductSku" VALUES ('cmmm37yt1004001lb7ql54wss', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 50 Diamonds', 'ffm-50', NULL, NULL, 7240, 8109, 7820, 7602, 7458, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.925', '2026-03-11 13:41:27.925');
INSERT INTO public."ProductSku" VALUES ('cmmm37yto004101lb53o6uwef', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 635 Diamonds', 'ffm-635', NULL, NULL, 81412, 91182, 87925, 85483, 83855, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.948', '2026-03-11 13:41:27.948');
INSERT INTO public."ProductSku" VALUES ('cmmm37yuh004201lb8m6j40rg', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 7.290 Diamonds', 'ffm-7290', NULL, NULL, 880053, 985660, 950458, 924056, 906455, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:27.977', '2026-03-11 13:41:27.977');
INSERT INTO public."ProductSku" VALUES ('cmmm37yve004301lb973v01zq', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 73.100 Diamonds', 'ffm-73100', NULL, NULL, 8800300, 9856337, 9504324, 9240315, 9064309, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.009', '2026-03-11 13:41:28.009');
INSERT INTO public."ProductSku" VALUES ('cmmm37yw4004401lbce5mmt3q', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max 860 Diamonds', 'ffm-860', NULL, NULL, 108540, 121565, 117224, 113967, 111797, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.036', '2026-03-11 13:41:28.036');
INSERT INTO public."ProductSku" VALUES ('cmmm37ywv004501lb6uizncd9', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max Membership Bulanan', 'ffmb-1', NULL, NULL, 82662, 92582, 89275, 86796, 85142, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.063', '2026-03-11 13:41:28.063');
INSERT INTO public."ProductSku" VALUES ('cmmm37yxf004601lbfye5pa6j', 'cmmm37ykx003n01lbfihsg10e', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Max Membership Mingguan', 'ffmm-1', NULL, NULL, 27298, 30574, 29482, 28663, 28117, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.083', '2026-03-11 13:41:28.083');
INSERT INTO public."ProductSku" VALUES ('cmmm37yy3004901lb0c8j51qd', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 100 FC Points', 'fifacoin-100', NULL, NULL, 14990, 16789, 16190, 15740, 15440, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.107', '2026-03-11 13:41:28.107');
INSERT INTO public."ProductSku" VALUES ('cmmm37yyq004a01lb6pk3ul3t', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 1.070 FC Points', 'fifacoin-1070', NULL, NULL, 150529, 168593, 162572, 158056, 155045, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.13', '2026-03-11 13:41:28.13');
INSERT INTO public."ProductSku" VALUES ('cmmm37yzd004b01lb3qpywett', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 12.000 FC Points', 'fifacoin-12000', NULL, NULL, 1513580, 1695210, 1634667, 1589259, 1558988, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.153', '2026-03-11 13:41:28.153');
INSERT INTO public."ProductSku" VALUES ('cmmm37z00004c01lbicdhch2e', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 1.999 Silver', 'fifacoin-1999', NULL, NULL, 307535, 344440, 332138, 322912, 316762, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.176', '2026-03-11 13:41:28.176');
INSERT INTO public."ProductSku" VALUES ('cmmm37z0n004d01lbbjmdlc86', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 2.200 FC Points', 'fifacoin-2200', NULL, NULL, 311444, 348818, 336360, 327017, 320788, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.199', '2026-03-11 13:41:28.199');
INSERT INTO public."ProductSku" VALUES ('cmmm37z18004e01lbw1ol9usv', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 40 FC Points', 'fifacoin-40', NULL, NULL, 6158, 6897, 6651, 6466, 6343, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.22', '2026-03-11 13:41:28.22');
INSERT INTO public."ProductSku" VALUES ('cmmm37z1u004f01lb75gyo4oh', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 499 Silver', 'fifacoin-499', NULL, NULL, 73873, 82738, 79783, 77567, 76090, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.242', '2026-03-11 13:41:28.242');
INSERT INTO public."ProductSku" VALUES ('cmmm37z2g004g01lbz0t10tsw', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 4.999 Silver', 'fifacoin-4999', NULL, NULL, 747931, 837683, 807766, 785328, 770369, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.264', '2026-03-11 13:41:28.264');
INSERT INTO public."ProductSku" VALUES ('cmmm37z31004h01lblcycypur', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 520 FC Points', 'fifacoin-520', NULL, NULL, 74804, 83781, 80789, 78545, 77049, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.285', '2026-03-11 13:41:28.285');
INSERT INTO public."ProductSku" VALUES ('cmmm37z3m004i01lbxs8ufaxh', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 5.750 FC Points', 'fifacoin-5750', NULL, NULL, 756329, 847089, 816836, 794146, 779019, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.306', '2026-03-11 13:41:28.306');
INSERT INTO public."ProductSku" VALUES ('cmmm37z49004j01lbiev2hyyv', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 99 Silver', 'fifacoin-99', NULL, NULL, 14965, 16761, 16163, 15714, 15414, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.329', '2026-03-11 13:41:28.329');
INSERT INTO public."ProductSku" VALUES ('cmmm37z4x004k01lb24oux9xp', 'cmmm37yxv004801lb2hnddoxk', 'cmmm2sm38000es0ojpyl0zxwk', 'FC Mobile 999 Silver', 'fifacoin-999', NULL, NULL, 148635, 166472, 160526, 156067, 153095, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.353', '2026-03-11 13:41:28.353');
INSERT INTO public."ProductSku" VALUES ('cmmm37z5i004l01lbjus9ni58', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 100 Diamond', 'freefire-100dm', NULL, NULL, 13097, 14669, 14145, 13752, 13490, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.374', '2026-03-11 13:41:28.374');
INSERT INTO public."ProductSku" VALUES ('cmmm37z65004m01lb9612vnor', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1050 Diamond', 'freefire-1050', NULL, NULL, 134043, 150129, 144767, 140746, 138065, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.396', '2026-03-11 13:41:28.396');
INSERT INTO public."ProductSku" VALUES ('cmmm37z6w004n01lb5mcgfjft', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1075 Diamond', 'freefire-1075dm', NULL, NULL, 136575, 152965, 147501, 143404, 140673, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.424', '2026-03-11 13:41:28.424');
INSERT INTO public."ProductSku" VALUES ('cmmm37z7j004o01lbsj75yruq', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1080 Diamond', 'freefire-1080dm', NULL, NULL, 137352, 153835, 148341, 144220, 141473, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.447', '2026-03-11 13:41:28.447');
INSERT INTO public."ProductSku" VALUES ('cmmm37z84004p01lbjtbseuf0', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1200 Diamond', 'freefire-1200dm', NULL, NULL, 153070, 171439, 165316, 160724, 157663, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.468', '2026-03-11 13:41:28.468');
INSERT INTO public."ProductSku" VALUES ('cmmm37z8r004q01lbazsbkk2v', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 12 Diamond', 'freefire-12dm', NULL, NULL, 1805, 2022, 1950, 1896, 1860, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.491', '2026-03-11 13:41:28.491');
INSERT INTO public."ProductSku" VALUES ('cmmm37z9j004r01lb2wwardwb', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1300 Diamond', 'freefire-1300dm', NULL, NULL, 166307, 186264, 179612, 174623, 171297, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.519', '2026-03-11 13:41:28.519');
INSERT INTO public."ProductSku" VALUES ('cmmm37za7004s01lb1sdy6ik0', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 130 Diamond', 'freefire-130dm', NULL, NULL, 17383, 19469, 18774, 18253, 17905, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.543', '2026-03-11 13:41:28.543');
INSERT INTO public."ProductSku" VALUES ('cmmm37zb5004t01lbtj9htbgu', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 140 Diamond', 'freefire-140dm', NULL, NULL, 18081, 20251, 19528, 18986, 18624, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.577', '2026-03-11 13:41:28.577');
INSERT INTO public."ProductSku" VALUES ('cmmm37zby004u01lb37v80sgv', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1450 Diamond', 'freefire-1450dm', NULL, NULL, 182696, 204620, 197312, 191831, 188177, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.606', '2026-03-11 13:41:28.606');
INSERT INTO public."ProductSku" VALUES ('cmmm37zct004v01lby0hn7ifr', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 145 Diamond', 'freefire-145dm', NULL, NULL, 19037, 21322, 20560, 19989, 19609, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.637', '2026-03-11 13:41:28.637');
INSERT INTO public."ProductSku" VALUES ('cmmm37zdk004w01lbl3n17hg3', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1875 Diamond', 'freefire-1875dm', NULL, NULL, 238280, 266874, 257343, 250194, 245429, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.664', '2026-03-11 13:41:28.664');
INSERT INTO public."ProductSku" VALUES ('cmmm37ze6004x01lbvfsaoshm', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 1975 Diamond', 'freefire-1975dm', NULL, NULL, 250552, 280619, 270597, 263080, 258069, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.686', '2026-03-11 13:41:28.686');
INSERT INTO public."ProductSku" VALUES ('cmmm37zes004y01lbkvcgr8aw', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 20 Diamond', 'freefire-20dm', NULL, NULL, 3329, 3729, 3596, 3496, 3429, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.708', '2026-03-11 13:41:28.708');
INSERT INTO public."ProductSku" VALUES ('cmmm37zfi004z01lbmdoye6z6', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 2100 Diamond', 'freefire-2100dm', NULL, NULL, 268061, 300229, 289506, 281465, 276103, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.734', '2026-03-11 13:41:28.734');
INSERT INTO public."ProductSku" VALUES ('cmmm37zgn005001lblnbvf1r4', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 2180 Diamond', 'freefire-2180dm', NULL, NULL, 276334, 309495, 298441, 290151, 284625, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.775', '2026-03-11 13:41:28.775');
INSERT INTO public."ProductSku" VALUES ('cmmm37zhm005101lbmoj6lrzx', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 2225 Diamond', 'freefire-2225dm', NULL, NULL, 282125, 315981, 304695, 296232, 290589, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.81', '2026-03-11 13:41:28.81');
INSERT INTO public."ProductSku" VALUES ('cmmm37zi8005201lbacuoexce', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 250 Diamond', 'freefire-250dm', NULL, NULL, 32959, 36915, 35596, 34607, 33948, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.832', '2026-03-11 13:41:28.832');
INSERT INTO public."ProductSku" VALUES ('cmmm37ziu005301lb2i1bl5xe', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 2575 Diamond', 'freefire-2575dm', NULL, NULL, 325299, 364335, 351323, 341564, 335058, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.854', '2026-03-11 13:41:28.854');
INSERT INTO public."ProductSku" VALUES ('cmmm37zji005401lbae6mnv3f', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 2750 Diamond', 'freefire-2750dm', NULL, NULL, 349961, 391957, 377958, 367460, 360460, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.878', '2026-03-11 13:41:28.878');
INSERT INTO public."ProductSku" VALUES ('cmmm37zk6005501lbwghfu48d', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 3000 Diamond', 'freefire-3000dm', NULL, NULL, 379743, 425313, 410123, 398731, 391136, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.902', '2026-03-11 13:41:28.902');
INSERT INTO public."ProductSku" VALUES ('cmmm37zl7005601lb4wg4u2rz', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 3310 Diamond', 'freefire-3310dm', NULL, NULL, 419452, 469787, 453009, 440425, 432036, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.939', '2026-03-11 13:41:28.939');
INSERT INTO public."ProductSku" VALUES ('cmmm37zm7005701lb8r3geby5', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 350 Diamond', 'freefire-350dm', NULL, NULL, 45525, 50989, 49167, 47802, 46891, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:28.975', '2026-03-11 13:41:28.975');
INSERT INTO public."ProductSku" VALUES ('cmmm37zmt005801lb7szc6qm3', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 355 Diamond', 'freefire-355dm', NULL, NULL, 44925, 50317, 48519, 47172, 46273, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:28.997', '2026-03-11 13:41:28.997');
INSERT INTO public."ProductSku" VALUES ('cmmm37zne005901lbk8ahxcnx', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 3640 Diamond', 'freefire-3640dm', NULL, NULL, 464180, 519882, 501315, 487389, 478106, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.018', '2026-03-11 13:41:29.018');
INSERT INTO public."ProductSku" VALUES ('cmmm37zo0005a01lb91hjpwkk', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 36500 Diamond', 'freefire-36500', NULL, NULL, 4550025, 5096029, 4914027, 4777527, 4686526, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.04', '2026-03-11 13:41:29.04');
INSERT INTO public."ProductSku" VALUES ('cmmm37zoo005b01lbz8mst6gn', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 3675 Diamond', 'freefire-3675', NULL, NULL, 464952, 520747, 502149, 488200, 478901, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.064', '2026-03-11 13:41:29.064');
INSERT INTO public."ProductSku" VALUES ('cmmm37zpb005c01lbyg67xyew', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 37050 Diamond', 'freefire-37050', NULL, NULL, 4621170, 5175711, 4990864, 4852229, 4759806, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.087', '2026-03-11 13:41:29.087');
INSERT INTO public."ProductSku" VALUES ('cmmm37zqc005d01lbsu2qwwfh', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 5 Diamond', 'freefire-3dm', NULL, NULL, 837, 938, 904, 879, 863, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.124', '2026-03-11 13:41:29.124');
INSERT INTO public."ProductSku" VALUES ('cmmm37zr2005e01lbtwtz7qcx', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 4850 Diamond', 'freefire-4850dm', NULL, NULL, 616343, 690305, 665651, 647161, 634834, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.15', '2026-03-11 13:41:29.15');
INSERT INTO public."ProductSku" VALUES ('cmmm37zrn005f01lblggrb208', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 50 Diamond', 'freefire-50dm', NULL, NULL, 6561, 7349, 7086, 6890, 6758, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:29.171', '2026-03-11 13:41:29.171');
INSERT INTO public."ProductSku" VALUES ('cmmm37zsa005g01lbbvixiv37', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 510 Diamond', 'freefire-510dm', NULL, NULL, 66207, 74152, 71504, 69518, 68194, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.194', '2026-03-11 13:41:29.194');
INSERT INTO public."ProductSku" VALUES ('cmmm37zsw005h01lbcmi5kayc', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 5500 Diamond', 'freefire-5500', NULL, NULL, 698243, 782033, 754103, 733156, 719191, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.216', '2026-03-11 13:41:29.216');
INSERT INTO public."ProductSku" VALUES ('cmmm37zti005i01lb22atd36l', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 55 Diamond', 'freefire-55dm', NULL, NULL, 7450, 8344, 8047, 7823, 7674, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.238', '2026-03-11 13:41:29.238');
INSERT INTO public."ProductSku" VALUES ('cmmm37zu7005j01lbdsvk8sfm', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 6550 Diamond', 'freefire-6550dm', NULL, NULL, 828125, 927501, 894376, 869532, 852969, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.263', '2026-03-11 13:41:29.263');
INSERT INTO public."ProductSku" VALUES ('cmmm37zuv005k01lbjf1n0697', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 700 Diamond', 'freefire-700dm', NULL, NULL, 91023, 101946, 98305, 95575, 93754, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.287', '2026-03-11 13:41:29.287');
INSERT INTO public."ProductSku" VALUES ('cmmm37zvg005l01lbfscj50jb', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 70 Diamond', 'freefire-70dm', NULL, NULL, 9010, 10092, 9731, 9461, 9281, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:29.308', '2026-03-11 13:41:29.308');
INSERT INTO public."ProductSku" VALUES ('cmmm37zw8005m01lbc8aeyd8h', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 720 Diamond', 'freefire-720', NULL, NULL, 89800, 100577, 96984, 94290, 92494, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:29.336', '2026-03-11 13:41:29.336');
INSERT INTO public."ProductSku" VALUES ('cmmm37zwt005n01lbcuzvj6qt', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 7290 Diamond', 'freefire-7290', NULL, NULL, 910025, 1019229, 982828, 955527, 937326, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.357', '2026-03-11 13:41:29.357');
INSERT INTO public."ProductSku" VALUES ('cmmm37zxg005o01lbdbc61b29', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 73100 Diamond', 'freefire-73100', NULL, NULL, 9100025, 10192029, 9828027, 9555027, 9373026, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.38', '2026-03-11 13:41:29.38');
INSERT INTO public."ProductSku" VALUES ('cmmm37zy3005p01lbimx7qamz', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 7650 Diamond', 'freefire-7650dm', NULL, NULL, 956352, 1071115, 1032861, 1004170, 985043, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.403', '2026-03-11 13:41:29.403');
INSERT INTO public."ProductSku" VALUES ('cmmm37zyo005q01lbly69mjci', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 925 Diamond', 'freefire-925dm', NULL, NULL, 118325, 132524, 127792, 124242, 121875, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.424', '2026-03-11 13:41:29.424');
INSERT INTO public."ProductSku" VALUES ('cmmm37zz9005r01lbutavra7t', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 95 Diamond', 'freefire-95dm', NULL, NULL, 13318, 14917, 14384, 13984, 13718, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:29.445', '2026-03-11 13:41:29.445');
INSERT INTO public."ProductSku" VALUES ('cmmm37zzv005s01lbpvf8qote', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire 9800 Diamond', 'freefire-9800', NULL, NULL, 1228525, 1375949, 1326807, 1289952, 1265381, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.467', '2026-03-11 13:41:29.467');
INSERT INTO public."ProductSku" VALUES ('cmmm3800g005t01lbf6hexxx7', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 1980+260 Genesis Crystals', 'gi1980', NULL, NULL, 357473, 400370, 386071, 375347, 368198, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.488', '2026-03-11 13:41:29.488');
INSERT INTO public."ProductSku" VALUES ('cmmm3801i005u01lbyactdejd', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 300+30 Genesis Crystals', 'gi300', NULL, NULL, 62810, 70348, 67835, 65951, 64695, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.526', '2026-03-11 13:41:29.526');
INSERT INTO public."ProductSku" VALUES ('cmmm38025005v01lbcdomweez', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 3280+600 Genesis Crystals', 'gi3280', NULL, NULL, 579960, 649556, 626357, 608958, 597359, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.549', '2026-03-11 13:41:29.549');
INSERT INTO public."ProductSku" VALUES ('cmmm3802q005w01lbbjwjz59m', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 60 Genesis Crystals', 'gi60', NULL, NULL, 12410, 13900, 13403, 13031, 12783, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.57', '2026-03-11 13:41:29.57');
INSERT INTO public."ProductSku" VALUES ('cmmm38048005x01lbbie9w0ze', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 6480+1600 Genesis Crystals', 'gi6480', NULL, NULL, 1122909, 1257659, 1212742, 1179055, 1156597, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.624', '2026-03-11 13:41:29.624');
INSERT INTO public."ProductSku" VALUES ('cmmm3805d005y01lbowg4pney', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 6480+1600 Genesis Crystals (2x)', 'gi6480-2', NULL, NULL, 2149532, 2407476, 2321495, 2257009, 2214018, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.665', '2026-03-11 13:41:29.665');
INSERT INTO public."ProductSku" VALUES ('cmmm3805x005z01lbs6oknfju', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 6480+1600 Genesis Crystals (3x)', 'gi6480-3', NULL, NULL, 3224285, 3611200, 3482228, 3385500, 3321014, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.685', '2026-03-11 13:41:29.685');
INSERT INTO public."ProductSku" VALUES ('cmmm3806k006001lblgl51s77', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 6480+1600 Genesis Crystals (4x)', 'gi6480-4', NULL, NULL, 4299038, 4814923, 4642962, 4513990, 4428010, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.708', '2026-03-11 13:41:29.708');
INSERT INTO public."ProductSku" VALUES ('cmmm38076006101lbes8y5sq3', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 9.760+2.200 Genesis Crystals', 'gi9760', NULL, NULL, 2004117, 2244612, 2164447, 2104323, 2064241, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.73', '2026-03-11 13:41:29.73');
INSERT INTO public."ProductSku" VALUES ('cmmm3807r006201lbwllgmmpj', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 980+110 Genesis Crystals', 'gi980', NULL, NULL, 170850, 191353, 184518, 179393, 175976, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.751', '2026-03-11 13:41:29.751');
INSERT INTO public."ProductSku" VALUES ('cmmm3808c006301lbm9pxuf2u', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact All Pack Genesis Crystals', 'giap-1', NULL, NULL, 2205949, 2470663, 2382425, 2316247, 2272128, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.772', '2026-03-11 13:41:29.772');
INSERT INTO public."ProductSku" VALUES ('cmmm38090006401lbou30rlek', 'cmmm37xdj001s01lb2bt88rtb', 'cmmm2sm38000es0ojpyl0zxwk', 'Genshin Impact 5-Star Character Guarantee Bundle', 'gisc-1', NULL, NULL, 3949619, 4423574, 4265589, 4147100, 4068108, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.796', '2026-03-11 13:41:29.796');
INSERT INTO public."ProductSku" VALUES ('cmmm3809l006501lbib91yf6e', 'cmmm37y9m003001lbn0pwccoo', 'cmmm2sm38000es0ojpyl0zxwk', 'Garena 165 Shell', 'GS-165', NULL, NULL, 48025, 53789, 51867, 50427, 49466, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.817', '2026-03-11 13:41:29.817');
INSERT INTO public."ProductSku" VALUES ('cmmm380aa006601lbydbkcdjs', 'cmmm37y9m003001lbn0pwccoo', 'cmmm2sm38000es0ojpyl0zxwk', 'Garena 33 Shell', 'GS-33', NULL, NULL, 9375, 10501, 10125, 9844, 9657, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.842', '2026-03-11 13:41:29.842');
INSERT INTO public."ProductSku" VALUES ('cmmm380b4006701lbq151hyr7', 'cmmm37y9m003001lbn0pwccoo', 'cmmm2sm38000es0ojpyl0zxwk', 'Garena 66 Shell', 'GS-66', NULL, NULL, 19375, 21701, 20925, 20344, 19957, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.872', '2026-03-11 13:41:29.872');
INSERT INTO public."ProductSku" VALUES ('cmmm380bt006a01lbxyu9yw1o', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 1980 Star Gems', 'hf-1980', NULL, NULL, 443581, 496811, 479068, 465761, 456889, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.897', '2026-03-11 13:41:29.897');
INSERT INTO public."ProductSku" VALUES ('cmmm380cf006b01lbuj98axdg', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 300 Star Gems', 'hf-300', NULL, NULL, 73706, 82551, 79603, 77392, 75918, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.918', '2026-03-11 13:41:29.918');
INSERT INTO public."ProductSku" VALUES ('cmmm380d0006c01lbzo2ie82s', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 3280 Star Gems', 'hf-3280', NULL, NULL, 739481, 828219, 798640, 776456, 761666, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.94', '2026-03-11 13:41:29.94');
INSERT INTO public."ProductSku" VALUES ('cmmm380dp006d01lb1e1wh488', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 60 Star Gems', 'hf-60', NULL, NULL, 14526, 16270, 15689, 15253, 14962, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:29.965', '2026-03-11 13:41:29.965');
INSERT INTO public."ProductSku" VALUES ('cmmm380ed006e01lb0ipql387', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 6480 Star Gems', 'hf-6480', NULL, NULL, 1479231, 1656739, 1597570, 1553193, 1523608, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:29.989', '2026-03-11 13:41:29.989');
INSERT INTO public."ProductSku" VALUES ('cmmm380f0006f01lbhjbr9yoe', 'cmmm380bl006901lb4yw974v7', 'cmmm2sm38000es0ojpyl0zxwk', 'Haikyu Fly High 980 Star Gems', 'hf-980', NULL, NULL, 221656, 248255, 239389, 232739, 228306, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.012', '2026-03-11 13:41:30.012');
INSERT INTO public."ProductSku" VALUES ('cmmm380fu006i01lb5sm5wkrn', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 1.200 Tokens', 'hok-1200', NULL, NULL, 216848, 242870, 234196, 227691, 223354, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.042', '2026-03-11 13:41:30.042');
INSERT INTO public."ProductSku" VALUES ('cmmm380gm006j01lbig5wl0b2', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 16 Tokens', 'hok-16', NULL, NULL, 2848, 3190, 3076, 2991, 2934, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.07', '2026-03-11 13:41:30.07');
INSERT INTO public."ProductSku" VALUES ('cmmm380h7006k01lbhn963j6i', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 23 Tokens', 'hok-23', NULL, NULL, 4550, 5097, 4914, 4778, 4687, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.091', '2026-03-11 13:41:30.091');
INSERT INTO public."ProductSku" VALUES ('cmmm380hu006l01lbiqku5enz', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 240 Tokens', 'hok-240', NULL, NULL, 44381, 49707, 47932, 46601, 45713, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.114', '2026-03-11 13:41:30.114');
INSERT INTO public."ProductSku" VALUES ('cmmm380ij006m01lbic1zhl9q', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 2.400 Tokens', 'hok-2400', NULL, NULL, 427894, 479242, 462126, 449289, 440731, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.139', '2026-03-11 13:41:30.139');
INSERT INTO public."ProductSku" VALUES ('cmmm380j8006n01lbuvaecdfw', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 400 Tokens', 'hok-400', NULL, NULL, 73894, 82762, 79806, 77589, 76111, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.164', '2026-03-11 13:41:30.164');
INSERT INTO public."ProductSku" VALUES ('cmmm380jt006o01lbupdl15wm', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 4.000 Tokens', 'hok-4000', NULL, NULL, 713232, 798820, 770291, 748894, 734629, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.185', '2026-03-11 13:41:30.185');
INSERT INTO public."ProductSku" VALUES ('cmmm380ke006p01lbqzgn58go', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 560 Tokens', 'hok-560', NULL, NULL, 103579, 116009, 111866, 108758, 106687, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.206', '2026-03-11 13:41:30.206');
INSERT INTO public."ProductSku" VALUES ('cmmm380l0006q01lbij5fb36t', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 8 Tokens', 'hok-8', NULL, NULL, 1621, 1816, 1751, 1703, 1670, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.227', '2026-03-11 13:41:30.227');
INSERT INTO public."ProductSku" VALUES ('cmmm380ln006r01lb1vq18bxv', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 80 Tokens', 'hok-80', NULL, NULL, 14508, 16249, 15669, 15234, 14944, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.251', '2026-03-11 13:41:30.251');
INSERT INTO public."ProductSku" VALUES ('cmmm380m8006s01lbj8zuvx1z', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 800 Tokens', 'hok-800', NULL, NULL, 147935, 165688, 159770, 155332, 152374, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.272', '2026-03-11 13:41:30.272');
INSERT INTO public."ProductSku" VALUES ('cmmm380mt006t01lbi17qwxwg', 'cmmm380fj006h01lbs930yqtt', 'cmmm2sm38000es0ojpyl0zxwk', 'Honor of Kings 8.000 Tokens', 'hok-8000', NULL, NULL, 1480674, 1658355, 1599128, 1554708, 1525095, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.293', '2026-03-11 13:41:30.293');
INSERT INTO public."ProductSku" VALUES ('cmmm380nf006w01lbe5gq5nvs', 'cmmm380n7006v01lbv689bvzj', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Impact 3 330 B-Chips', 'HonkaiImpact3-330b', NULL, NULL, 76377, 85543, 82488, 80196, 78669, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.315', '2026-03-11 13:41:30.315');
INSERT INTO public."ProductSku" VALUES ('cmmm380o3006x01lbaitjx41b', 'cmmm380n7006v01lbv689bvzj', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Impact 3 65 B-Chips', 'HonkaiImpact3-65b', NULL, NULL, 15660, 17540, 16913, 16443, 16130, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.339', '2026-03-11 13:41:30.339');
INSERT INTO public."ProductSku" VALUES ('cmmm380oo006y01lblpoxbv7b', 'cmmm380n7006v01lbv689bvzj', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Impact 3 990 B-Chips', 'HonkaiImpact3-990b', NULL, NULL, 223174, 249955, 241028, 234333, 229870, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.36', '2026-03-11 13:41:30.36');
INSERT INTO public."ProductSku" VALUES ('cmmm380pd006z01lbtk1kbvtk', 'cmmm380n7006v01lbv689bvzj', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Impact 3 Monthly Card', 'HonkaiImpact3-mothly', NULL, NULL, 76387, 85554, 82498, 80207, 78679, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:30.385', '2026-03-11 13:41:30.385');
INSERT INTO public."ProductSku" VALUES ('cmmm380py007201lbwjvden78', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 6480+1600 Monochrome x3', 'hs3r-6480', NULL, NULL, 3195096, 3578508, 3450704, 3354851, 3290949, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.406', '2026-03-11 13:41:30.406');
INSERT INTO public."ProductSku" VALUES ('cmmm380qk007301lbva12utnt', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 1280+140 Oneiric Shard', 'hsr-1280', NULL, NULL, 220514, 246976, 238156, 231540, 227130, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.428', '2026-03-11 13:41:30.428');
INSERT INTO public."ProductSku" VALUES ('cmmm380r6007401lb6kx0vzkf', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 1960+220 Oneiric Shard', 'hsr-1960', NULL, NULL, 341398, 382366, 368710, 358468, 351640, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.45', '2026-03-11 13:41:30.45');
INSERT INTO public."ProductSku" VALUES ('cmmm380rt007501lbaa9mdsbj', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 1980+260 Oneiric Shard', 'hsr-1980', NULL, NULL, 358426, 401438, 387101, 376348, 369179, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.473', '2026-03-11 13:41:30.473');
INSERT INTO public."ProductSku" VALUES ('cmmm380sm007601lbfx5n6mh4', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 300+30 Oneiric Shard', 'hsr-300', NULL, NULL, 53916, 60386, 58230, 56612, 55534, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.502', '2026-03-11 13:41:30.502');
INSERT INTO public."ProductSku" VALUES ('cmmm380ue007701lbhh7kntye', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 3280+600 Oneiric Shard', 'hsr-3280', NULL, NULL, 586795, 657211, 633739, 616135, 604399, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.566', '2026-03-11 13:41:30.566');
INSERT INTO public."ProductSku" VALUES ('cmmm380vn007801lbjwjv7swp', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 60 Oneiric Shard', 'hsr-60', NULL, NULL, 10800, 12097, 11664, 11340, 11124, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.611', '2026-03-11 13:41:30.611');
INSERT INTO public."ProductSku" VALUES ('cmmm380wi007901lbanvapmvd', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 6480+1600 Oneiric Shard', 'hsr-6480', NULL, NULL, 1074226, 1203134, 1160165, 1127938, 1106453, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.642', '2026-03-11 13:41:30.642');
INSERT INTO public."ProductSku" VALUES ('cmmm380x7007a01lbc1h2n08i', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 9.760+2.200 Oneiric Shard', 'hsr-9760', NULL, NULL, 1643403, 1840612, 1774876, 1725574, 1692706, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.667', '2026-03-11 13:41:30.667');
INSERT INTO public."ProductSku" VALUES ('cmmm380y0007b01lbxo2qrobw', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 980+110 Oneiric Shard', 'hsr-980', NULL, NULL, 166623, 186618, 179953, 174955, 171622, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.696', '2026-03-11 13:41:30.696');
INSERT INTO public."ProductSku" VALUES ('cmmm380yu007c01lbzaij70q3', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail  6480+1600 Monochrome x2', 'hsr2-6480', NULL, NULL, 2130073, 2385682, 2300479, 2236577, 2193976, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.726', '2026-03-11 13:41:30.726');
INSERT INTO public."ProductSku" VALUES ('cmmm3810e007d01lb0eni6y23', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 6480+1600 Monochrome x4', 'hsr4-6480', NULL, NULL, 4260120, 4771335, 4600930, 4473126, 4387924, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.782', '2026-03-11 13:41:30.782');
INSERT INTO public."ProductSku" VALUES ('cmmm3811f007e01lbditlj9b5', 'cmmm380pq007101lbnogsgqy1', 'cmmm2sm38000es0ojpyl0zxwk', 'Honkai Star Rail 6480+1600 Monochrome x5', 'hsr5-6480', NULL, NULL, 5325144, 5964162, 5751156, 5591402, 5484899, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.819', '2026-03-11 13:41:30.819');
INSERT INTO public."ProductSku" VALUES ('cmmm3811z007h01lbprurvgoi', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1.000 Wild Cores', 'lolw-1000', NULL, NULL, 117325, 131404, 126712, 123192, 120845, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.839', '2026-03-11 13:41:30.839');
INSERT INTO public."ProductSku" VALUES ('cmmm3812i007i01lb2bcfx9qg', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 10.000 Wild Cores', 'lolw-10000', NULL, NULL, 1044199, 1169503, 1127735, 1096409, 1075525, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.858', '2026-03-11 13:41:30.858');
INSERT INTO public."ProductSku" VALUES ('cmmm3813s007j01lbrcxdzj6j', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1030 Wild Cores', 'lolw-1030', NULL, NULL, 156633, 175429, 169164, 164465, 161332, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.904', '2026-03-11 13:41:30.904');
INSERT INTO public."ProductSku" VALUES ('cmmm3814e007k01lbvdoca49w', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 105 Wild Cores', 'lolw-105', NULL, NULL, 13910, 15580, 15023, 14606, 14328, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.926', '2026-03-11 13:41:30.926');
INSERT INTO public."ProductSku" VALUES ('cmmm3814z007l01lb4zkgefcz', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1125 Wild Cores', 'lolw-1125', NULL, NULL, 156633, 175429, 169164, 164465, 161332, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.947', '2026-03-11 13:41:30.947');
INSERT INTO public."ProductSku" VALUES ('cmmm3815x007m01lb4jcurwym', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1135 Wild Cores', 'lolw-1135', NULL, NULL, 139185, 155888, 150320, 146145, 143361, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:30.981', '2026-03-11 13:41:30.981');
INSERT INTO public."ProductSku" VALUES ('cmmm3816l007n01lbfmoycmhz', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1375 Wild Cores', 'lolw-1375', NULL, NULL, 156350, 175113, 168858, 164168, 161041, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.005', '2026-03-11 13:41:31.005');
INSERT INTO public."ProductSku" VALUES ('cmmm3817h007o01lbnlh74yd5', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1650 Wild Cores', 'lolw-1650', NULL, NULL, 208844, 233906, 225552, 219287, 215110, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.037', '2026-03-11 13:41:31.037');
INSERT INTO public."ProductSku" VALUES ('cmmm38188007p01lbczi14x7r', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1660 Wild Cores', 'lolw-1660', NULL, NULL, 194260, 217572, 209801, 203973, 200088, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.064', '2026-03-11 13:41:31.064');
INSERT INTO public."ProductSku" VALUES ('cmmm3818v007q01lb76mbiaxk', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1830 Wild Cores', 'lolw-1830', NULL, NULL, 207439, 232332, 224035, 217811, 213663, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.087', '2026-03-11 13:41:31.087');
INSERT INTO public."ProductSku" VALUES ('cmmm3819k007r01lbdoxmejpn', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 1.850 Wild Cores', 'lolw-1850', NULL, NULL, 211165, 236505, 228059, 221724, 217500, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.112', '2026-03-11 13:41:31.112');
INSERT INTO public."ProductSku" VALUES ('cmmm381a9007s01lbqbyrxqpp', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 235 Wild Cores', 'lolw-235', NULL, NULL, 52211, 58477, 56388, 54822, 53778, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.137', '2026-03-11 13:41:31.137');
INSERT INTO public."ProductSku" VALUES ('cmmm381au007t01lbyl1albul', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 2400 Wild Cores', 'lolw-2400', NULL, NULL, 259750, 290920, 280530, 272738, 267543, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.158', '2026-03-11 13:41:31.158');
INSERT INTO public."ProductSku" VALUES ('cmmm381bg007u01lbw4f0howi', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 300 Wild Cores', 'lolw-300', NULL, NULL, 52211, 58477, 56388, 54822, 53778, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.18', '2026-03-11 13:41:31.18');
INSERT INTO public."ProductSku" VALUES ('cmmm381c1007v01lbi07x9vzr', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 3010 Wild Cores', 'lolw-3010', NULL, NULL, 333969, 374046, 360687, 350668, 343989, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.201', '2026-03-11 13:41:31.201');
INSERT INTO public."ProductSku" VALUES ('cmmm381cm007w01lbdvjiybx1', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 3.275 Wild Cores', 'lolw-3275', NULL, NULL, 365242, 409072, 394462, 383505, 376200, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.222', '2026-03-11 13:41:31.222');
INSERT INTO public."ProductSku" VALUES ('cmmm381dc007x01lb4auumwr4', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 3330 Wild Cores', 'lolw-3330', NULL, NULL, 420339, 470780, 453967, 441356, 432950, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.248', '2026-03-11 13:41:31.248');
INSERT INTO public."ProductSku" VALUES ('cmmm381dz007y01lbb6rk8y0w', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 3400 Wild Cores', 'lolw-3400', NULL, NULL, 420339, 470780, 453967, 441356, 432950, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.271', '2026-03-11 13:41:31.271');
INSERT INTO public."ProductSku" VALUES ('cmmm381ej007z01lb0qajoy0u', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 350 Wild Cores', 'lolw-350', NULL, NULL, 46475, 52053, 50193, 48799, 47870, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.291', '2026-03-11 13:41:31.291');
INSERT INTO public."ProductSku" VALUES ('cmmm381f6008001lb3512i9ut', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 4000 Wild Cores', 'lolw-4000', NULL, NULL, 414850, 464633, 448039, 435593, 427296, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.314', '2026-03-11 13:41:31.314');
INSERT INTO public."ProductSku" VALUES ('cmmm381g4008101lb7qocdp14', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 420 Wild Cores', 'lolw-420', NULL, NULL, 52950, 59305, 57187, 55598, 54539, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.348', '2026-03-11 13:41:31.348');
INSERT INTO public."ProductSku" VALUES ('cmmm381gw008201lbn8r8taxu', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 425 Wild Cores', 'lolw-425', NULL, NULL, 52575, 58885, 56782, 55204, 54153, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.376', '2026-03-11 13:41:31.376');
INSERT INTO public."ProductSku" VALUES ('cmmm381hj008301lbld1gg7t8', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 4.800 Wild Cores', 'lolw-4800', NULL, NULL, 522424, 585115, 564218, 548546, 538097, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.399', '2026-03-11 13:41:31.399');
INSERT INTO public."ProductSku" VALUES ('cmmm381i3008401lbmp7mud4e', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 585 Wild Cores', 'lolw-585', NULL, NULL, 74015, 82897, 79937, 77716, 76236, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.419', '2026-03-11 13:41:31.419');
INSERT INTO public."ProductSku" VALUES ('cmmm381io008501lbcspqf9ea', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 605 Wild Cores', 'lolw-605', NULL, NULL, 104422, 116953, 112776, 109644, 107555, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.44', '2026-03-11 13:41:31.44');
INSERT INTO public."ProductSku" VALUES ('cmmm381j9008601lbgq6ooyr6', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 6210 Wild Cores', 'lolw-6210', NULL, NULL, 695826, 779326, 751493, 730618, 716701, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.461', '2026-03-11 13:41:31.461');
INSERT INTO public."ProductSku" VALUES ('cmmm381kb008701lb2yi7ceuz', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 625 Wild Cores', 'lolw-625', NULL, NULL, 104422, 116953, 112776, 109644, 107555, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.498', '2026-03-11 13:41:31.498');
INSERT INTO public."ProductSku" VALUES ('cmmm381lb008801lbt4rispca', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 700 Wild Cores', 'lolw-700', NULL, NULL, 84000, 94081, 90720, 88200, 86520, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.535', '2026-03-11 13:41:31.535');
INSERT INTO public."ProductSku" VALUES ('cmmm381o0008901lbozhbnl8c', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 7000 Wild Cores', 'lolw-7000', NULL, NULL, 788465, 883081, 851543, 827889, 812119, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.632', '2026-03-11 13:41:31.632');
INSERT INTO public."ProductSku" VALUES ('cmmm381pi008a01lbjocvob7h', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 7005 Wild Cores', 'lolw-7005', NULL, NULL, 788465, 883081, 851543, 827889, 812119, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.686', '2026-03-11 13:41:31.686');
INSERT INTO public."ProductSku" VALUES ('cmmm381qb008b01lbqbvzj9fa', 'cmmm3811s007g01lbxa353ey1', 'cmmm2sm38000es0ojpyl0zxwk', 'League of Legends Wild Rift 8150 Wild Cores', 'lolw-8150', NULL, NULL, 946890, 1060517, 1022642, 994235, 975297, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.715', '2026-03-11 13:41:31.715');
INSERT INTO public."ProductSku" VALUES ('cmmm381r2008e01lbp1duhkvk', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 134 Diamonds', 'lordmobile-134dm', NULL, NULL, 19860, 22244, 21449, 20853, 20456, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:31.742', '2026-03-11 13:41:31.742');
INSERT INTO public."ProductSku" VALUES ('cmmm381s0008f01lb0u6jqt9v', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 2011 Diamonds', 'lordmobile-2011dm', NULL, NULL, 289575, 324325, 312741, 304054, 298263, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:31.776', '2026-03-11 13:41:31.776');
INSERT INTO public."ProductSku" VALUES ('cmmm381t4008g01lbdik9yh0i', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 3352 Diamonds', 'lordmobile-3352dm', NULL, NULL, 480125, 537740, 518536, 504132, 494529, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:31.816', '2026-03-11 13:41:31.816');
INSERT INTO public."ProductSku" VALUES ('cmmm381u8008h01lb83n54jwu', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 335 Diamonds', 'lordmobile-335dm', NULL, NULL, 49775, 55749, 53757, 52264, 51269, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.856', '2026-03-11 13:41:31.856');
INSERT INTO public."ProductSku" VALUES ('cmmm381us008i01lbuqsapw70', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 670 Diamonds', 'lordmobile-670dm', NULL, NULL, 97575, 109285, 105381, 102454, 100503, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:31.876', '2026-03-11 13:41:31.876');
INSERT INTO public."ProductSku" VALUES ('cmmm381vd008j01lbdlgcsund', 'cmmm381qu008d01lbpa9v467o', 'cmmm2sm38000es0ojpyl0zxwk', 'Lords Mobile 67 Diamonds', 'lordmobile-67dm', NULL, NULL, 9955, 11150, 10752, 10453, 10254, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:31.897', '2026-03-11 13:41:31.897');
INSERT INTO public."ProductSku" VALUES ('cmmm381wc008k01lb28uodq0n', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Level Up Pass', 'lv-1', NULL, NULL, 14800, 16576, 15985, 15540, 15244, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.932', '2026-03-11 13:41:31.932');
INSERT INTO public."ProductSku" VALUES ('cmmm381wx008l01lbmcrj3rtv', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Bulanan', 'mb-1', NULL, NULL, 83200, 93185, 89856, 87360, 85696, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.953', '2026-03-11 13:41:31.953');
INSERT INTO public."ProductSku" VALUES ('cmmm381xm008m01lb89syxi7v', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Bulanan x2', 'mb-2', NULL, NULL, 165480, 185338, 178719, 173754, 170445, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:31.978', '2026-03-11 13:41:31.978');
INSERT INTO public."ProductSku" VALUES ('cmmm381ya008n01lbw4liu75c', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Bulanan x3', 'mb-3', NULL, NULL, 248207, 277992, 268064, 260618, 255654, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.002', '2026-03-11 13:41:32.002');
INSERT INTO public."ProductSku" VALUES ('cmmm381yv008q01lb3m3klz3z', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 12 Diamonds', 'mcgg-12', NULL, NULL, 2950, 3305, 3186, 3098, 3039, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.023', '2026-03-11 13:41:32.023');
INSERT INTO public."ProductSku" VALUES ('cmmm381zf008r01lbcwxqcg1o', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go First Recharge 150+150 Diamonds', 'mcgg-150', NULL, NULL, 38525, 43149, 41607, 40452, 39681, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.043', '2026-03-11 13:41:32.043');
INSERT INTO public."ProductSku" VALUES ('cmmm38202008s01lbjyctmwh5', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 170 Diamonds', 'mcgg-170', NULL, NULL, 41236, 46185, 44535, 43298, 42474, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.066', '2026-03-11 13:41:32.066');
INSERT INTO public."ProductSku" VALUES ('cmmm3820w008t01lbgfwi1jvm', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 19 Diamonds', 'mcgg-19', NULL, NULL, 4555, 5102, 4920, 4783, 4692, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.096', '2026-03-11 13:41:32.096');
INSERT INTO public."ProductSku" VALUES ('cmmm3821n008u01lbmfr7kwki', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 2.010 Diamonds', 'mcgg-2010', NULL, NULL, 445785, 499280, 481448, 468075, 459159, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.122', '2026-03-11 13:41:32.122');
INSERT INTO public."ProductSku" VALUES ('cmmm3822b008v01lbri0gs1i3', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 240 Diamonds', 'mcgg-240', NULL, NULL, 55596, 62268, 60044, 58376, 57264, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.146', '2026-03-11 13:41:32.146');
INSERT INTO public."ProductSku" VALUES ('cmmm3822w008w01lbd601fsw9', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go First Recharge 250+250 Diamonds', 'mcgg-250', NULL, NULL, 64350, 72072, 69498, 67568, 66281, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.168', '2026-03-11 13:41:32.168');
INSERT INTO public."ProductSku" VALUES ('cmmm3823g008x01lbyk15wt48', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 28 Diamonds', 'mcgg-28', NULL, NULL, 6696, 7500, 7232, 7031, 6897, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.188', '2026-03-11 13:41:32.188');
INSERT INTO public."ProductSku" VALUES ('cmmm38243008y01lbzkkmdz6n', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 296 Diamonds', 'mcgg-296', NULL, NULL, 68309, 76507, 73774, 71725, 70359, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.211', '2026-03-11 13:41:32.211');
INSERT INTO public."ProductSku" VALUES ('cmmm3824r008z01lbu24v9cld', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 408 Diamonds', 'mcgg-408', NULL, NULL, 94581, 105931, 102148, 99311, 97419, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.234', '2026-03-11 13:41:32.234');
INSERT INTO public."ProductSku" VALUES ('cmmm3825q009001lbtm1yax5l', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 44 Diamonds', 'mcgg-44', NULL, NULL, 10715, 12001, 11573, 11251, 11037, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.27', '2026-03-11 13:41:32.27');
INSERT INTO public."ProductSku" VALUES ('cmmm3826k009101lb8ae6xuae', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 4.830 Diamonds', 'mcgg-4830', NULL, NULL, 1071206, 1199751, 1156903, 1124767, 1103343, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.3', '2026-03-11 13:41:32.3');
INSERT INTO public."ProductSku" VALUES ('cmmm38275009201lbnslvxtvv', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 5 Diamonds', 'mcgg-5', NULL, NULL, 1344, 1506, 1452, 1412, 1385, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.321', '2026-03-11 13:41:32.321');
INSERT INTO public."ProductSku" VALUES ('cmmm3827o009301lbvqgbtg8b', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go First Recharge 50+50 Diamonds', 'mcgg-50', NULL, NULL, 12860, 14404, 13889, 13503, 13246, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.34', '2026-03-11 13:41:32.34');
INSERT INTO public."ProductSku" VALUES ('cmmm38288009401lbstdsodxf', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go First Recharge 500+500 Diamonds', 'mcgg-500', NULL, NULL, 129350, 144872, 139698, 135818, 133231, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.36', '2026-03-11 13:41:32.36');
INSERT INTO public."ProductSku" VALUES ('cmmm38290009501lbngrzx51y', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 568 Diamonds', 'mcgg-568', NULL, NULL, 127803, 143140, 138028, 134194, 131638, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.388', '2026-03-11 13:41:32.388');
INSERT INTO public."ProductSku" VALUES ('cmmm3829u009601lbmxk2sez5', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 59 Diamonds', 'mcgg-59', NULL, NULL, 14194, 15898, 15330, 14904, 14620, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.418', '2026-03-11 13:41:32.418');
INSERT INTO public."ProductSku" VALUES ('cmmm382ae009701lbn3ho82ze', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 85 Diamonds', 'mcgg-85', NULL, NULL, 20616, 23090, 22266, 21647, 21235, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.438', '2026-03-11 13:41:32.438');
INSERT INTO public."ProductSku" VALUES ('cmmm382b0009801lbzfvey3ss', 'cmmm381yo008p01lbqex62x3g', 'cmmm2sm38000es0ojpyl0zxwk', 'Magic Chess Go Go 875 Diamonds', 'mcgg-875', NULL, NULL, 200858, 224961, 216927, 210901, 206884, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.46', '2026-03-11 13:41:32.46');
INSERT INTO public."ProductSku" VALUES ('cmmm382bt009901lb4ke21vkd', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 10 Diamond', 'ml-10', NULL, NULL, 2868, 3213, 3098, 3012, 2955, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.489', '2026-03-11 13:41:32.489');
INSERT INTO public."ProductSku" VALUES ('cmmm382cf009a01lbsx87id3x', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 1000 Diamond', 'ml-1000', NULL, NULL, 270119, 302534, 291729, 283625, 278223, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.511', '2026-03-11 13:41:32.511');
INSERT INTO public."ProductSku" VALUES ('cmmm382d3009b01lbp494bxce', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 11 Diamond', 'ml-11', NULL, NULL, 3569, 3998, 3855, 3748, 3677, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.535', '2026-03-11 13:41:32.535');
INSERT INTO public."ProductSku" VALUES ('cmmm382dp009c01lbwozigr77', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 1159 Diamond', 'ml-1159dm', NULL, NULL, 287841, 322382, 310869, 302234, 296477, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.557', '2026-03-11 13:41:32.557');
INSERT INTO public."ProductSku" VALUES ('cmmm382eb009d01lbmtv3uf3e', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 12 Diamond', 'ml-12dm', NULL, NULL, 3318, 3717, 3584, 3484, 3418, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.579', '2026-03-11 13:41:32.579');
INSERT INTO public."ProductSku" VALUES ('cmmm382ew009e01lb4e2wo28v', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 148 Diamond', 'ml-148', NULL, NULL, 37461, 41957, 40458, 39335, 38585, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.6', '2026-03-11 13:41:32.6');
INSERT INTO public."ProductSku" VALUES ('cmmm382fj009f01lbje11uctr', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 1506 Diamond', 'ml-1506', NULL, NULL, 383782, 429836, 414485, 402972, 395296, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.623', '2026-03-11 13:41:32.623');
INSERT INTO public."ProductSku" VALUES ('cmmm382g5009g01lbcxav0ork', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 170 Diamond', 'ml-170dm', NULL, NULL, 43600, 48833, 47088, 45780, 44908, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.645', '2026-03-11 13:41:32.645');
INSERT INTO public."ProductSku" VALUES ('cmmm382gq009h01lbbm7y2es7', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 172 Diamond', 'ml-172', NULL, NULL, 47912, 53662, 51745, 50308, 49350, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.666', '2026-03-11 13:41:32.666');
INSERT INTO public."ProductSku" VALUES ('cmmm382hd009i01lb6jgwtgvb', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 183 Diamond', 'ml-183', NULL, NULL, 51986, 58225, 56145, 54586, 53546, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.689', '2026-03-11 13:41:32.689');
INSERT INTO public."ProductSku" VALUES ('cmmm382hw009j01lbchahw9e8', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 184 Diamond', 'ml-184', NULL, NULL, 51989, 58228, 56149, 54589, 53549, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.708', '2026-03-11 13:41:32.708');
INSERT INTO public."ProductSku" VALUES ('cmmm382im009k01lbps4ia4v6', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 18576 Diamond', 'ml-18576', NULL, NULL, 4366663, 4890663, 4715997, 4584997, 4497663, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.734', '2026-03-11 13:41:32.734');
INSERT INTO public."ProductSku" VALUES ('cmmm382jg009l01lb5pta08he', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 185 Diamond', 'ml-185dm', NULL, NULL, 47608, 53321, 51417, 49989, 49037, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.764', '2026-03-11 13:41:32.764');
INSERT INTO public."ProductSku" VALUES ('cmmm382k4009m01lbxlpve2qm', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 193 Diamond + Starlight Member', 'ML-193-Dm-Starlight-mbr', NULL, NULL, 211415, 236785, 228329, 221986, 217758, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.788', '2026-03-11 13:41:32.788');
INSERT INTO public."ProductSku" VALUES ('cmmm382ko009n01lb8lzvaeml', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 20 Diamond', 'ml-20', NULL, NULL, 5735, 6424, 6194, 6022, 5908, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.808', '2026-03-11 13:41:32.808');
INSERT INTO public."ProductSku" VALUES ('cmmm382l8009o01lbnqmehqjp', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 20130 Diamond', 'ml-20130', NULL, NULL, 4708125, 5273101, 5084775, 4943532, 4849369, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.828', '2026-03-11 13:41:32.828');
INSERT INTO public."ProductSku" VALUES ('cmmm382ls009p01lbozzvpyj8', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 222 Diamond', 'ml-222dm', NULL, NULL, 56263, 63015, 60765, 59077, 57951, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.848', '2026-03-11 13:41:32.848');
INSERT INTO public."ProductSku" VALUES ('cmmm382me009q01lbocijle3w', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 2398 Diamond', 'ml-2398', NULL, NULL, 617197, 691261, 666573, 648057, 635713, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.87', '2026-03-11 13:41:32.87');
INSERT INTO public."ProductSku" VALUES ('cmmm382n2009r01lbvzvs7lt0', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 24 Diamond', 'ml-24', NULL, NULL, 7055, 7902, 7620, 7408, 7267, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.894', '2026-03-11 13:41:32.894');
INSERT INTO public."ProductSku" VALUES ('cmmm382nm009s01lbnwltcfcm', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 250 Diamond', 'ml-250', NULL, NULL, 65469, 73326, 70707, 68743, 67434, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.914', '2026-03-11 13:41:32.914');
INSERT INTO public."ProductSku" VALUES ('cmmm382o6009t01lbpvfisota', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 28 Diamond', 'ml-28dm', NULL, NULL, 7582, 8492, 8189, 7962, 7810, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.934', '2026-03-11 13:41:32.934');
INSERT INTO public."ProductSku" VALUES ('cmmm382ot009u01lbcl7jgr4l', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 296 Diamond', 'ml-296dm', NULL, NULL, 76447, 85621, 82563, 80270, 78741, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:32.957', '2026-03-11 13:41:32.957');
INSERT INTO public."ProductSku" VALUES ('cmmm382pd009v01lbvo9qw9mo', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 34 Diamond', 'ml-34', NULL, NULL, 10706, 11991, 11563, 11242, 11028, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:32.977', '2026-03-11 13:41:32.977');
INSERT INTO public."ProductSku" VALUES ('cmmm382q0009w01lb92cuy9n1', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 3453 Diamond', 'ml-3453', NULL, NULL, 839521, 940264, 906683, 881498, 864707, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33', '2026-03-11 13:41:33');
INSERT INTO public."ProductSku" VALUES ('cmmm382qk009x01lb08ejrgly', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 36 Diamond', 'ml-36dm', NULL, NULL, 9483, 10621, 10242, 9958, 9768, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.02', '2026-03-11 13:41:33.02');
INSERT INTO public."ProductSku" VALUES ('cmmm382r4009y01lbx3e5z9py', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 370 Diamond', 'ml-370dm', NULL, NULL, 93755, 105006, 101256, 98443, 96568, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.04', '2026-03-11 13:41:33.04');
INSERT INTO public."ProductSku" VALUES ('cmmm382ro009z01lbh37jod58', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 3 Diamond', 'ml-3dm', NULL, NULL, 1002, 1123, 1083, 1053, 1033, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:33.06', '2026-03-11 13:41:33.06');
INSERT INTO public."ProductSku" VALUES ('cmmm382s900a001lbtk1ob3vg', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 425 Diamond', 'ml-425', NULL, NULL, 108162, 121142, 116815, 113571, 111407, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.081', '2026-03-11 13:41:33.081');
INSERT INTO public."ProductSku" VALUES ('cmmm382sy00a101lb0kltuu7p', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 44 Diamond', 'ml-44', NULL, NULL, 12241, 13710, 13221, 12854, 12609, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.106', '2026-03-11 13:41:33.106');
INSERT INTO public."ProductSku" VALUES ('cmmm382to00a201lbb1zvjlax', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 45 Diamond', 'ml-45', NULL, NULL, 12245, 13715, 13225, 12858, 12613, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.132', '2026-03-11 13:41:33.132');
INSERT INTO public."ProductSku" VALUES ('cmmm382ua00a301lbl5edqzhl', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 46 Diamond', 'ml-46', NULL, NULL, 12696, 14220, 13712, 13331, 13077, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.154', '2026-03-11 13:41:33.154');
INSERT INTO public."ProductSku" VALUES ('cmmm382uv00a401lbp55w9utc', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 4830 Diamond', 'ml-4830dm', NULL, NULL, 1122546, 1257252, 1212350, 1178674, 1156223, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.175', '2026-03-11 13:41:33.175');
INSERT INTO public."ProductSku" VALUES ('cmmm382vf00a501lbajzekck9', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 5 Diamond', 'ml-5', NULL, NULL, 1680, 1882, 1815, 1764, 1731, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.195', '2026-03-11 13:41:33.195');
INSERT INTO public."ProductSku" VALUES ('cmmm382w200a601lb2erodxfw', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 50 Diamond', 'ml-50', NULL, NULL, 13600, 15233, 14689, 14280, 14008, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.218', '2026-03-11 13:41:33.218');
INSERT INTO public."ProductSku" VALUES ('cmmm382wo00a701lbjfvz29xy', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 5052 Diamond', 'ml-5052', NULL, NULL, 1207527, 1352431, 1304130, 1267904, 1243753, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.24', '2026-03-11 13:41:33.24');
INSERT INTO public."ProductSku" VALUES ('cmmm382x800a801lbsfehcmj9', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 56 Diamond', 'ml-56', NULL, NULL, 16309, 18267, 17614, 17125, 16799, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.26', '2026-03-11 13:41:33.26');
INSERT INTO public."ProductSku" VALUES ('cmmm382xt00a901lbwv7w07na', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 568 Diamond', 'ml-568dm', NULL, NULL, 141895, 158923, 153247, 148990, 146152, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.281', '2026-03-11 13:41:33.281');
INSERT INTO public."ProductSku" VALUES ('cmmm382yd00aa01lbodafkii1', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 59 Diamond', 'ml-59dm', NULL, NULL, 15085, 16896, 16292, 15840, 15538, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.301', '2026-03-11 13:41:33.301');
INSERT INTO public."ProductSku" VALUES ('cmmm382yz00ab01lbdltm6j02', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 6050 Diamond', 'ml-6050dm', NULL, NULL, 1442145, 1615203, 1557517, 1514253, 1485410, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.323', '2026-03-11 13:41:33.323');
INSERT INTO public."ProductSku" VALUES ('cmmm382zn00ac01lbjifzd34w', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 67 Diamond', 'ml-67dm', NULL, NULL, 19390, 21717, 20942, 20360, 19972, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.347', '2026-03-11 13:41:33.347');
INSERT INTO public."ProductSku" VALUES ('cmmm3830b00ad01lb31tf7umn', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 708 Diamond', 'ml-708', NULL, NULL, 192143, 215201, 207515, 201751, 197908, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.371', '2026-03-11 13:41:33.371');
INSERT INTO public."ProductSku" VALUES ('cmmm3830w00ae01lb7tf4eq2a', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 7210 Diamond', 'ml-7210', NULL, NULL, 1725303, 1932340, 1863328, 1811569, 1777063, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.392', '2026-03-11 13:41:33.392');
INSERT INTO public."ProductSku" VALUES ('cmmm3831g00af01lbr935xiu1', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 74 Diamond', 'ml-74dm', NULL, NULL, 18756, 21007, 20257, 19694, 19319, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.412', '2026-03-11 13:41:33.412');
INSERT INTO public."ProductSku" VALUES ('cmmm3832000ag01lbvhmh4o3f', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 78 Diamond', 'ml-78', NULL, NULL, 20186, 22609, 21801, 21196, 20792, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.432', '2026-03-11 13:41:33.432');
INSERT INTO public."ProductSku" VALUES ('cmmm3832m00ah01lbfdqqa74q', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 80 Diamond', 'ml-80', NULL, NULL, 21028, 23552, 22711, 22080, 21659, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.454', '2026-03-11 13:41:33.454');
INSERT INTO public."ProductSku" VALUES ('cmmm3833800ai01lbalrjfd17', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 85 Diamond', 'ml-85dm', NULL, NULL, 20750, 23241, 22410, 21788, 21373, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.476', '2026-03-11 13:41:33.476');
INSERT INTO public."ProductSku" VALUES ('cmmm3833v00aj01lb3h7rlypm', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 875 Diamond', 'ml-875dm', NULL, NULL, 228348, 255750, 246616, 239766, 235199, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:33.499', '2026-03-11 13:41:33.499');
INSERT INTO public."ProductSku" VALUES ('cmmm3834h00ak01lbn8l9l2uk', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 88 Diamond', 'ml-88', NULL, NULL, 23409, 26219, 25282, 24580, 24112, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.521', '2026-03-11 13:41:33.521');
INSERT INTO public."ProductSku" VALUES ('cmmm3835100al01lb47rqzc42', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILELEGEND - 4 Diamond + Starlight Member', 'ml-Starlight-', NULL, NULL, 77434, 86727, 83629, 81306, 79758, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:33.541', '2026-03-11 13:41:33.541');
INSERT INTO public."ProductSku" VALUES ('cmmm3835m00ao01lbm6q35exm', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 10.999 M-Cash', 'mla-10999', NULL, NULL, 1563519, 1751142, 1688601, 1641695, 1610425, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.562', '2026-03-11 13:41:33.562');
INSERT INTO public."ProductSku" VALUES ('cmmm3836700ap01lbil8nupfg', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 1.499 M-Cash', 'mla-1499', NULL, NULL, 227295, 254571, 245479, 238660, 234114, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.583', '2026-03-11 13:41:33.583');
INSERT INTO public."ProductSku" VALUES ('cmmm3837000aq01lbo5yg61sd', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 1.999 M-Cash', 'mla-1999', NULL, NULL, 296882, 332508, 320633, 311727, 305789, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.612', '2026-03-11 13:41:33.612');
INSERT INTO public."ProductSku" VALUES ('cmmm3837m00ar01lblmpfkm1i', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 2.999 M-Cash', 'mla-2999', NULL, NULL, 454276, 508790, 490619, 476990, 467905, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.634', '2026-03-11 13:41:33.634');
INSERT INTO public."ProductSku" VALUES ('cmmm3838a00as01lb7aksellt', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 32.999 M-Cash', 'mla-32999', NULL, NULL, 4681302, 5243059, 5055807, 4915368, 4821742, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.658', '2026-03-11 13:41:33.658');
INSERT INTO public."ProductSku" VALUES ('cmmm3838v00at01lb797rz0io', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 4.999 M-Cash', 'mla-4999', NULL, NULL, 705707, 790392, 762164, 740993, 726879, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.679', '2026-03-11 13:41:33.679');
INSERT INTO public."ProductSku" VALUES ('cmmm3839g00au01lbk5lbv380', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 65.999 M-Cash', 'mla-65999', NULL, NULL, 9367435, 10491528, 10116830, 9835807, 9648459, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.7', '2026-03-11 13:41:33.7');
INSERT INTO public."ProductSku" VALUES ('cmmm383a300av01lbckxvd5x0', 'cmmm3835e00an01lbqfzjacy6', 'cmmm2sm38000es0ojpyl0zxwk', 'Mobile Legends Adventure 9.999 M-Cash', 'mla-9999', NULL, NULL, 1413045, 1582611, 1526089, 1483698, 1455437, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.723', '2026-03-11 13:41:33.723');
INSERT INTO public."ProductSku" VALUES ('cmmm383aq00aw01lb6b0kkrhc', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Monthly Epic Bundle', 'mlme-1', NULL, NULL, 69016, 77298, 74538, 72467, 71087, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.746', '2026-03-11 13:41:33.746');
INSERT INTO public."ProductSku" VALUES ('cmmm383ba00ax01lbpn8s1s0n', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Startlight Member', 'mlsm-1', NULL, NULL, 76900, 86129, 83052, 80745, 79207, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.766', '2026-03-11 13:41:33.766');
INSERT INTO public."ProductSku" VALUES ('cmmm383bx00ay01lbehmpbpe8', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Startlight Member Plus', 'mlsmp-1', NULL, NULL, 189525, 212269, 204687, 199002, 195211, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.789', '2026-03-11 13:41:33.789');
INSERT INTO public."ProductSku" VALUES ('cmmm383ch00az01lb31doq8f5', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Weekly Diamond Pass', 'mlwdp-1', NULL, NULL, 27300, 30577, 29485, 28665, 28119, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.809', '2026-03-11 13:41:33.809');
INSERT INTO public."ProductSku" VALUES ('cmmm383d300b001lbweojc0tz', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Weekly Diamond Pass 2x', 'mlwdp-2', NULL, NULL, 54575, 61125, 58942, 57304, 56213, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.831', '2026-03-11 13:41:33.831');
INSERT INTO public."ProductSku" VALUES ('cmmm383do00b101lbnq6gzosz', 'cmmm37xgy001y01lb90kzbyq5', 'cmmm2sm38000es0ojpyl0zxwk', 'MOBILE LEGENDS Weekly Diamond Pass 3x', 'mlwdp-3', NULL, NULL, 81850, 91673, 88398, 85943, 84306, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.852', '2026-03-11 13:41:33.852');
INSERT INTO public."ProductSku" VALUES ('cmmm383e800b201lbl310ydxv', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Mingguan', 'mm-1', NULL, NULL, 28525, 31949, 30808, 29952, 29381, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.872', '2026-03-11 13:41:33.872');
INSERT INTO public."ProductSku" VALUES ('cmmm383es00b301lbhc2apjez', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Mingguan x2', 'mm-2', NULL, NULL, 55177, 61799, 59592, 57936, 56833, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.892', '2026-03-11 13:41:33.892');
INSERT INTO public."ProductSku" VALUES ('cmmm383fc00b401lbnqhdn4s8', 'cmmm37wg7000n01lblbok9kwi', 'cmmm2sm38000es0ojpyl0zxwk', 'Free Fire Membership Mingguan x3', 'mm-3', NULL, NULL, 82752, 92683, 89373, 86890, 85235, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.912', '2026-03-11 13:41:33.912');
INSERT INTO public."ProductSku" VALUES ('cmmm383fx00b701lb0nvoefbq', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 107 Kupon', 'op107', NULL, NULL, 166855, 186878, 180204, 175198, 171861, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.933', '2026-03-11 13:41:33.933');
INSERT INTO public."ProductSku" VALUES ('cmmm383gg00b801lbhbdkfmzb', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 109 Kupon', 'op109', NULL, NULL, 195000, 218401, 210600, 204750, 200850, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.952', '2026-03-11 13:41:33.952');
INSERT INTO public."ProductSku" VALUES ('cmmm383h300b901lb0xwz50o6', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 13 Kupon', 'op13', NULL, NULL, 22372, 25057, 24162, 23491, 23044, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.975', '2026-03-11 13:41:33.975');
INSERT INTO public."ProductSku" VALUES ('cmmm383hm00ba01lbvqv2bm7u', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 16.013 Kupon', 'op16013', NULL, NULL, 25745510, 28834972, 27805151, 27032786, 26517876, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:33.994', '2026-03-11 13:41:33.994');
INSERT INTO public."ProductSku" VALUES ('cmmm383i900bb01lbkauz3xhz', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 214 Kupon', 'op214', NULL, NULL, 333685, 373728, 360380, 350370, 343696, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.017', '2026-03-11 13:41:34.017');
INSERT INTO public."ProductSku" VALUES ('cmmm383is00bc01lb0h75rq64', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 22 Kupon', 'op22', NULL, NULL, 33391, 37398, 36063, 35061, 34393, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.036', '2026-03-11 13:41:34.036');
INSERT INTO public."ProductSku" VALUES ('cmmm383jb00bd01lb1xkefpby', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 227 Kupon', 'op227', NULL, NULL, 400422, 448473, 432456, 420444, 412435, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.055', '2026-03-11 13:41:34.055');
INSERT INTO public."ProductSku" VALUES ('cmmm383jv00be01lbgy1bc8j6', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 23 Kupon', 'op23', NULL, NULL, 40026, 44830, 43229, 42028, 41227, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.075', '2026-03-11 13:41:34.075');
INSERT INTO public."ProductSku" VALUES ('cmmm383ki00bf01lbb2g4jwkz', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 2.669 Kupon', 'op2669', NULL, NULL, 4170775, 4671268, 4504437, 4379314, 4295899, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.098', '2026-03-11 13:41:34.098');
INSERT INTO public."ProductSku" VALUES ('cmmm383l600bg01lb3gqaycxd', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 321 Kupon', 'op321', NULL, NULL, 500515, 560577, 540557, 525541, 515531, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.122', '2026-03-11 13:41:34.122');
INSERT INTO public."ProductSku" VALUES ('cmmm383md00bh01lbf1gn8rmx', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 362 Kupon', 'op362', NULL, NULL, 650000, 728001, 702000, 682500, 669500, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.165', '2026-03-11 13:41:34.165');
INSERT INTO public."ProductSku" VALUES ('cmmm383n100bi01lbvv3i85oo', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 37 Kupon', 'op37', NULL, NULL, 65355, 73198, 70584, 68623, 67316, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.189', '2026-03-11 13:41:34.189');
INSERT INTO public."ProductSku" VALUES ('cmmm383ns00bj01lbnyjagzo8', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 5 Kupon', 'op5', NULL, NULL, 7989, 8948, 8629, 8389, 8229, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.215', '2026-03-11 13:41:34.215');
INSERT INTO public."ProductSku" VALUES ('cmmm383oy00bk01lboqux49uo', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 54 Kupon', 'op54', NULL, NULL, 83440, 93453, 90116, 87612, 85944, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.258', '2026-03-11 13:41:34.258');
INSERT INTO public."ProductSku" VALUES ('cmmm383qm00bl01lbcj01xudm', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 6 Kupon', 'op6', NULL, NULL, 8264, 9256, 8926, 8678, 8512, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.318', '2026-03-11 13:41:34.318');
INSERT INTO public."ProductSku" VALUES ('cmmm383rk00bm01lbbkyh1wno', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 61 Kupon', 'op61', NULL, NULL, 106763, 119575, 115305, 112102, 109966, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.352', '2026-03-11 13:41:34.352');
INSERT INTO public."ProductSku" VALUES ('cmmm383s900bn01lbcab7nnyg', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 8.007 Kupon', 'op8007', NULL, NULL, 12852250, 14394521, 13880430, 13494863, 13237818, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.377', '2026-03-11 13:41:34.377');
INSERT INTO public."ProductSku" VALUES ('cmmm383t000bo01lb8socz7q4', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 904 Kupon', 'op904', NULL, NULL, 1625000, 1820001, 1755000, 1706250, 1673750, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.404', '2026-03-11 13:41:34.404');
INSERT INTO public."ProductSku" VALUES ('cmmm383tm00bp01lb28731liy', 'cmmm383fp00b601lb5ff26y1b', 'cmmm2sm38000es0ojpyl0zxwk', 'One Punch Man 91 Kupon', 'op91', NULL, NULL, 160186, 179409, 173001, 168196, 164992, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.426', '2026-03-11 13:41:34.426');
INSERT INTO public."ProductSku" VALUES ('cmmm383ua00bs01lbyil2qrob', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '1.200 PB Cash', 'pb-1200', NULL, NULL, 9700, 10865, 10476, 10185, 9991, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.45', '2026-03-11 13:41:34.45');
INSERT INTO public."ProductSku" VALUES ('cmmm383ux00bt01lbryhaxj7f', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '12.000 PB Cash', 'pb-12000', NULL, NULL, 93175, 104357, 100629, 97834, 95971, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.473', '2026-03-11 13:41:34.473');
INSERT INTO public."ProductSku" VALUES ('cmmm383vl00bu01lb9z7lq35s', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '15.000 PB Cash', 'pb-15000', NULL, NULL, 117000, 131041, 126361, 122850, 120510, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.497', '2026-03-11 13:41:34.497');
INSERT INTO public."ProductSku" VALUES ('cmmm383w800bv01lbnw98ze3u', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '2.400 PB Cash', 'pb-2400', NULL, NULL, 18625, 20861, 20115, 19557, 19184, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.52', '2026-03-11 13:41:34.52');
INSERT INTO public."ProductSku" VALUES ('cmmm383ww00bw01lbxlwp48nx', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '24.000 PB Cash', 'pb-24000', NULL, NULL, 179025, 200509, 193347, 187977, 184396, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.544', '2026-03-11 13:41:34.544');
INSERT INTO public."ProductSku" VALUES ('cmmm383xk00bx01lbhfdmtyg9', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '30.000 PB Cash', 'pb-30000', NULL, NULL, 219706, 246071, 237283, 230692, 226298, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.568', '2026-03-11 13:41:34.568');
INSERT INTO public."ProductSku" VALUES ('cmmm383y400by01lbccuwjnua', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '36.000 PB Cash', 'pb-36000', NULL, NULL, 268525, 300748, 290007, 281952, 276581, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.588', '2026-03-11 13:41:34.588');
INSERT INTO public."ProductSku" VALUES ('cmmm383yx00bz01lb289ztenq', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '45.000 PB Cash', 'pb-45000', NULL, NULL, 360000, 403201, 388800, 378000, 370800, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.615', '2026-03-11 13:41:34.615');
INSERT INTO public."ProductSku" VALUES ('cmmm383zo00c001lb6hp51psv', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '6.000 PB Cash', 'pb-6000', NULL, NULL, 46925, 52557, 50679, 49272, 48333, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.644', '2026-03-11 13:41:34.644');
INSERT INTO public."ProductSku" VALUES ('cmmm3840d00c101lbj51xex6r', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '60.000 PB Cash', 'pb-60000', NULL, NULL, 450025, 504029, 486028, 472527, 463526, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.669', '2026-03-11 13:41:34.669');
INSERT INTO public."ProductSku" VALUES ('cmmm3841100c201lbld2yy4mm', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '7.000 PB Cash', 'pb-7000', NULL, NULL, 54000, 60481, 58321, 56700, 55620, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.693', '2026-03-11 13:41:34.693');
INSERT INTO public."ProductSku" VALUES ('cmmm3841n00c301lbg76fxfhf', 'cmmm383u200br01lbf3d65ofm', 'cmmm2sm38000es0ojpyl0zxwk', '70.000 PB Cash', 'pb-70000', NULL, NULL, 540000, 604800, 583200, 567000, 556200, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.715', '2026-03-11 13:41:34.715');
INSERT INTO public."ProductSku" VALUES ('cmmm3842a00c601lbs1be7v2n', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 12 Aeos Gems', 'pu-12', NULL, NULL, 2861, 3205, 3090, 3005, 2947, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.738', '2026-03-11 13:41:34.738');
INSERT INTO public."ProductSku" VALUES ('cmmm3842w00c701lby6v0rhzc', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 1.220 + Bonus Aeos Gems', 'pu-1220', NULL, NULL, 234931, 263123, 253726, 246678, 241979, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.76', '2026-03-11 13:41:34.76');
INSERT INTO public."ProductSku" VALUES ('cmmm3843k00c801lb7fryy6v6', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 24 Aeos Gems', 'pu-24', NULL, NULL, 5817, 6516, 6283, 6108, 5992, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.784', '2026-03-11 13:41:34.784');
INSERT INTO public."ProductSku" VALUES ('cmmm3844b00c901lbgcsdcxic', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 245 + Bonus Aeos Gems', 'pu-245', NULL, NULL, 46435, 52008, 50150, 48757, 47829, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.811', '2026-03-11 13:41:34.811');
INSERT INTO public."ProductSku" VALUES ('cmmm3844v00ca01lbs1qs685x', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 2.450 + Bonus Aeos Gems', 'pu-2450', NULL, NULL, 463411, 519021, 500484, 486582, 477314, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.831', '2026-03-11 13:41:34.831');
INSERT INTO public."ProductSku" VALUES ('cmmm3845f00cb01lba20aqxkc', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 3.050 + Bonus Aeos Gems', 'pu-3050', NULL, NULL, 570511, 638973, 616152, 599037, 587627, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.851', '2026-03-11 13:41:34.851');
INSERT INTO public."ProductSku" VALUES ('cmmm3846100cc01lbyj0zllt5', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 490 + Bonus Aeos Gems', 'pu-490', NULL, NULL, 92131, 103187, 99502, 96738, 94895, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.873', '2026-03-11 13:41:34.873');
INSERT INTO public."ProductSku" VALUES ('cmmm3846r00cd01lbyek1hgcz', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 60 Aeos Gems', 'pu-60', NULL, NULL, 11434, 12807, 12349, 12006, 11778, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.899', '2026-03-11 13:41:34.899');
INSERT INTO public."ProductSku" VALUES ('cmmm3847d00ce01lb56ax4dh0', 'cmmm3842000c501lbr5duwn0a', 'cmmm2sm38000es0ojpyl0zxwk', 'Pokemon Unite 6.000 + Bonus Aeos Gems', 'pu-6000', NULL, NULL, 1143686, 1280929, 1235181, 1200871, 1177997, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.921', '2026-03-11 13:41:34.921');
INSERT INTO public."ProductSku" VALUES ('cmmm3847x00cf01lbj82kz06m', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 100 UC', 'PUBG-100UC', NULL, NULL, 28310, 31708, 30575, 29726, 29160, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:34.941', '2026-03-11 13:41:34.941');
INSERT INTO public."ProductSku" VALUES ('cmmm3848f00cg01lbk70zt3wm', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 120 UC', 'pubg-120', NULL, NULL, 29583, 33133, 31950, 31063, 30471, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.959', '2026-03-11 13:41:34.959');
INSERT INTO public."ProductSku" VALUES ('cmmm3849200ch01lbznbin7zp', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 12263 UC', 'pubg-12263', NULL, NULL, 2334013, 2614095, 2520735, 2450714, 2404034, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:34.982', '2026-03-11 13:41:34.982');
INSERT INTO public."ProductSku" VALUES ('cmmm3849p00ci01lblll6kufp', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 125 UC', 'PUBG-125UC', NULL, NULL, 47725, 53453, 51543, 50112, 49157, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.005', '2026-03-11 13:41:35.005');
INSERT INTO public."ProductSku" VALUES ('cmmm384a900cj01lb4rnd4r0r', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 150 UC', 'PUBG-150UC', NULL, NULL, 30597, 34269, 33045, 32127, 31515, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.025', '2026-03-11 13:41:35.025');
INSERT INTO public."ProductSku" VALUES ('cmmm384av00ck01lbv9mplez6', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 210 UC', 'pubg-210', NULL, NULL, 60506, 67767, 65347, 63532, 62322, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.047', '2026-03-11 13:41:35.047');
INSERT INTO public."ProductSku" VALUES ('cmmm384bh00cl01lbyisadj2f', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 250 UC', 'PUBG-250UC', NULL, NULL, 70515, 78977, 76157, 74041, 72631, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.069', '2026-03-11 13:41:35.069');
INSERT INTO public."ProductSku" VALUES ('cmmm384c200cm01lbcmn3i02l', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 48600 UC', 'pubg-48600', NULL, NULL, 8917560, 9987668, 9630965, 9363438, 9185087, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.09', '2026-03-11 13:41:35.09');
INSERT INTO public."ProductSku" VALUES ('cmmm384cx00cn01lb3jp2s31x', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 50 UC', 'PUBG-50UC', NULL, NULL, 13995, 15675, 15115, 14695, 14415, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.121', '2026-03-11 13:41:35.121');
INSERT INTO public."ProductSku" VALUES ('cmmm384dk00co01lbxx3i6xjy', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 600 UC', 'PUBG-600UC', NULL, NULL, 152149, 170407, 164321, 159757, 156714, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.144', '2026-03-11 13:41:35.144');
INSERT INTO public."ProductSku" VALUES ('cmmm384iz00cp01lbov7wlqsi', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 89100 UC', 'pubg-89100', NULL, NULL, 14862600, 16646113, 16051609, 15605730, 15308478, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.339', '2026-03-11 13:41:35.339');
INSERT INTO public."ProductSku" VALUES ('cmmm384lf00cq01lbpi4w3l54', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 9000 UC', 'pubg-9000', NULL, NULL, 1750516, 1960578, 1890558, 1838042, 1803032, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:35.427', '2026-03-11 13:41:35.427');
INSERT INTO public."ProductSku" VALUES ('cmmm384rd00cr01lbxlh059bz', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 1250 UC', 'PUBGMOBILE-1250uc', NULL, NULL, 236800, 265216, 255745, 248640, 243904, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.641', '2026-03-11 13:41:35.641');
INSERT INTO public."ProductSku" VALUES ('cmmm384td00cs01lb6x5yelq5', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 2500 UC', 'PUBGMOBILE-2500uc', NULL, NULL, 437915, 490465, 472949, 459811, 451053, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.713', '2026-03-11 13:41:35.713');
INSERT INTO public."ProductSku" VALUES ('cmmm384zi00ct01lb923tvuhc', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 4000 UC', 'PUBGMOBILE-4000uc', NULL, NULL, 759725, 850893, 820503, 797712, 782517, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:35.934', '2026-03-11 13:41:35.934');
INSERT INTO public."ProductSku" VALUES ('cmmm3852o00cu01lb4u4pizjr', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 5000 UC', 'PUBGMOBILE-5000uc', NULL, NULL, 895300, 1002737, 966925, 940065, 922159, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.048', '2026-03-11 13:41:36.048');
INSERT INTO public."ProductSku" VALUES ('cmmm3853x00cv01lb0btpkw01', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 7000 UC', 'PUBGMOBILE-7000', NULL, NULL, 1426120, 1597255, 1540210, 1497426, 1468904, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.093', '2026-03-11 13:41:36.093');
INSERT INTO public."ProductSku" VALUES ('cmmm3855e00cw01lb4dh2dukc', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 700 UC', 'PUBGMOBILE-700UC', NULL, NULL, 135537, 151802, 146380, 142314, 139604, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.146', '2026-03-11 13:41:36.146');
INSERT INTO public."ProductSku" VALUES ('cmmm3856500cx01lbs1e4cebw', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE 800 UC', 'PUBGMOBILE-800uc', NULL, NULL, 154514, 173056, 166876, 162240, 159150, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.173', '2026-03-11 13:41:36.173');
INSERT INTO public."ProductSku" VALUES ('cmmm3856v00d001lbfzhfhzdd', 'cmmm3856n00cz01lbz7xx20n5', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Origin 125 Nyan Berry', 'RagnarokOrigin-125', NULL, NULL, 37255, 41726, 40236, 39118, 38373, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.199', '2026-03-11 13:41:36.199');
INSERT INTO public."ProductSku" VALUES ('cmmm3857k00d101lb5wegc970', 'cmmm3856n00cz01lbz7xx20n5', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Origin 210 Nyan Berry', 'RagnarokOrigin-210', NULL, NULL, 60795, 68091, 65659, 63835, 62619, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.224', '2026-03-11 13:41:36.224');
INSERT INTO public."ProductSku" VALUES ('cmmm3858b00d201lbsc6v43rl', 'cmmm3856n00cz01lbz7xx20n5', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Origin 40 Nyan Berry', 'RagnarokOrigin-40', NULL, NULL, 12710, 14236, 13727, 13346, 13092, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.251', '2026-03-11 13:41:36.251');
INSERT INTO public."ProductSku" VALUES ('cmmm3859300d301lb9v2g3j3z', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'Pubg Royale Pass', 'rp-1', NULL, NULL, 178574, 200003, 192860, 187503, 183932, 12, 8, 5, 3, -1, 'INACTIVE', 0, NULL, '2026-03-11 13:41:36.279', '2026-03-11 13:41:36.279');
INSERT INTO public."ProductSku" VALUES ('cmmm3859s00d601lbmv6a8ubn', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 10.000 Big Cat Gem', 'rt-10000', NULL, NULL, 21046036, 23571561, 22729719, 22098338, 21677418, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.304', '2026-03-11 13:41:36.304');
INSERT INTO public."ProductSku" VALUES ('cmmm385ai00d701lbfr754295', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 1.200 Big Cat Gem', 'rt-1200', NULL, NULL, 2530105, 2833718, 2732514, 2656611, 2606009, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.33', '2026-03-11 13:41:36.33');
INSERT INTO public."ProductSku" VALUES ('cmmm385b700d801lb77yc3a47', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 180 Big Cat Gem', 'rt-180', NULL, NULL, 379157, 424656, 409490, 398115, 390532, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.355', '2026-03-11 13:41:36.355');
INSERT INTO public."ProductSku" VALUES ('cmmm385bu00d901lb7tnfovhp', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 3.000 Big Cat Gem', 'rt-3000', NULL, NULL, 6321427, 7079999, 6827142, 6637499, 6511070, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.378', '2026-03-11 13:41:36.378');
INSERT INTO public."ProductSku" VALUES ('cmmm385cg00da01lbtnjhyzud', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 35 Big Cat Gem', 'rt-35', NULL, NULL, 73724, 82571, 79622, 77411, 75936, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.4', '2026-03-11 13:41:36.4');
INSERT INTO public."ProductSku" VALUES ('cmmm385d300db01lbn4x8chw5', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 360 Big Cat Gem', 'rt-360', NULL, NULL, 759049, 850135, 819773, 797002, 781821, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.423', '2026-03-11 13:41:36.423');
INSERT INTO public."ProductSku" VALUES ('cmmm385do00dc01lbymhirrw1', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 4.000 Big Cat Gem', 'rt-4000', NULL, NULL, 8433625, 9445660, 9108315, 8855307, 8686634, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.444', '2026-03-11 13:41:36.444');
INSERT INTO public."ProductSku" VALUES ('cmmm385ed00dd01lbqi96z2t3', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 6.000 Big Cat Gem', 'rt-6000', NULL, NULL, 12612436, 14125929, 13621431, 13243058, 12990810, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.469', '2026-03-11 13:41:36.469');
INSERT INTO public."ProductSku" VALUES ('cmmm385f400de01lbz9ikal13', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 680 Big Cat Gem', 'rt-680', NULL, NULL, 1428419, 1599830, 1542693, 1499840, 1471272, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.496', '2026-03-11 13:41:36.496');
INSERT INTO public."ProductSku" VALUES ('cmmm385fq00df01lb6aadq4rl', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 70 Big Cat Gem', 'rt-70', NULL, NULL, 147423, 165114, 159217, 154795, 151846, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.518', '2026-03-11 13:41:36.518');
INSERT INTO public."ProductSku" VALUES ('cmmm385gh00dg01lblptxube6', 'cmmm3859i00d501lb1yp7w52d', 'cmmm2sm38000es0ojpyl0zxwk', 'Ragnarok Twilight 8.000 Big Cat Gem', 'rt-8000', NULL, NULL, 16867225, 18891292, 18216603, 17710587, 17373242, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.545', '2026-03-11 13:41:36.545');
INSERT INTO public."ProductSku" VALUES ('cmmm385hc00dj01lbldpsoj68', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 1280 Candies', 'sm1280', NULL, NULL, 260025, 291228, 280827, 273027, 267826, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.576', '2026-03-11 13:41:36.576');
INSERT INTO public."ProductSku" VALUES ('cmmm385i000dk01lb405maqf3', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 1368 Candies', 'sm1368', NULL, NULL, 252525, 282828, 272727, 265152, 260101, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.6', '2026-03-11 13:41:36.6');
INSERT INTO public."ProductSku" VALUES ('cmmm385ir00dl01lb429qi2qo', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 180 Candies', 'sm180', NULL, NULL, 38380, 42986, 41451, 40299, 39532, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.627', '2026-03-11 13:41:36.627');
INSERT INTO public."ProductSku" VALUES ('cmmm385jt00dm01lbq8l7pmhk', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 186 Candies', 'sm186', NULL, NULL, 39703, 44468, 42880, 41689, 40895, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.664', '2026-03-11 13:41:36.664');
INSERT INTO public."ProductSku" VALUES ('cmmm385m500dn01lbjuqaogbw', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 1980 Candies', 'sm1980', NULL, NULL, 403025, 451389, 435267, 423177, 415116, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.749', '2026-03-11 13:41:36.749');
INSERT INTO public."ProductSku" VALUES ('cmmm385nj00do01lb14w401lg', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 2118 Candies', 'sm2118', NULL, NULL, 376525, 421709, 406647, 395352, 387821, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.799', '2026-03-11 13:41:36.799');
INSERT INTO public."ProductSku" VALUES ('cmmm385ob00dp01lb32e0r5rv', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 300 Candies', 'sm300', NULL, NULL, 67025, 75068, 72387, 70377, 69036, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.827', '2026-03-11 13:41:36.827');
INSERT INTO public."ProductSku" VALUES ('cmmm385pe00dq01lbko7jccry', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 316 Candies', 'sm316', NULL, NULL, 63025, 70588, 68067, 66177, 64916, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.866', '2026-03-11 13:41:36.866');
INSERT INTO public."ProductSku" VALUES ('cmmm385q900dr01lb96sqa124', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 318 Candies', 'sm318', NULL, NULL, 62995, 70555, 68035, 66145, 64885, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.897', '2026-03-11 13:41:36.897');
INSERT INTO public."ProductSku" VALUES ('cmmm385r300ds01lb8lisrpss', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 3280 Candies', 'sm3280', NULL, NULL, 680025, 761629, 734427, 714027, 700426, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.927', '2026-03-11 13:41:36.927');
INSERT INTO public."ProductSku" VALUES ('cmmm385ro00dt01lbqp5hrxg4', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 3548 Candies', 'sm3548', NULL, NULL, 630525, 706189, 680967, 662052, 649441, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.948', '2026-03-11 13:41:36.948');
INSERT INTO public."ProductSku" VALUES ('cmmm385se00du01lb76njin2n', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 60 Candies', 'sm60', NULL, NULL, 12559, 14067, 13564, 13187, 12936, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:36.974', '2026-03-11 13:41:36.974');
INSERT INTO public."ProductSku" VALUES ('cmmm385t400dv01lbfkica1g9', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 61 Candies', 'sm61', NULL, NULL, 12330, 13810, 13317, 12947, 12700, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37', '2026-03-11 13:41:37');
INSERT INTO public."ProductSku" VALUES ('cmmm385tt00dw01lb9idtdqep', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 6480 Candies', 'sm6480', NULL, NULL, 1350025, 1512029, 1458027, 1417527, 1390526, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.025', '2026-03-11 13:41:37.025');
INSERT INTO public."ProductSku" VALUES ('cmmm385uh00dx01lbgt4q2nnt', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 680 Candies', 'sm680', NULL, NULL, 139024, 155707, 150146, 145976, 143195, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.049', '2026-03-11 13:41:37.049');
INSERT INTO public."ProductSku" VALUES ('cmmm385v300dy01lbutt3657m', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 686 Candies', 'sm686', NULL, NULL, 133412, 149422, 144085, 140083, 137415, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.071', '2026-03-11 13:41:37.071');
INSERT INTO public."ProductSku" VALUES ('cmmm385vn00dz01lbeodnl61t', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 7048 Candies', 'sm7048', NULL, NULL, 1195025, 1338429, 1290627, 1254777, 1230876, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.091', '2026-03-11 13:41:37.091');
INSERT INTO public."ProductSku" VALUES ('cmmm385we00e001lb27qv5wiz', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 7108 Candies', 'sm7108', NULL, NULL, 1260860, 1412164, 1361729, 1323903, 1298686, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.118', '2026-03-11 13:41:37.118');
INSERT INTO public."ProductSku" VALUES ('cmmm385x000e101lbgx583csf', 'cmmm385h300di01lbxumdtnk3', 'cmmm2sm38000es0ojpyl0zxwk', 'Sausage Man 718 Candies', 'sm718', NULL, NULL, 141400, 158369, 152712, 148470, 145642, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.14', '2026-03-11 13:41:37.14');
INSERT INTO public."ProductSku" VALUES ('cmmm385xv00e401lbeh8d8sj6', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 100 Diamonds', 'sos-100', NULL, NULL, 14735, 16504, 15914, 15472, 15178, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.171', '2026-03-11 13:41:37.171');
INSERT INTO public."ProductSku" VALUES ('cmmm385ym00e501lbyllho9a7', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 1.000 Diamonds', 'sos-1000', NULL, NULL, 147272, 164945, 159054, 154636, 151691, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.198', '2026-03-11 13:41:37.198');
INSERT INTO public."ProductSku" VALUES ('cmmm385zj00e601lb2tk2bpqj', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 10.000 Diamonds', 'sos-10000', NULL, NULL, 1497282, 1676956, 1617065, 1572147, 1542201, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.231', '2026-03-11 13:41:37.231');
INSERT INTO public."ProductSku" VALUES ('cmmm3860700e701lbvw34xgq4', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 100.000 Diamonds', 'sos-100000', NULL, NULL, 14972966, 16769722, 16170804, 15721615, 15422155, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.255', '2026-03-11 13:41:37.255');
INSERT INTO public."ProductSku" VALUES ('cmmm3860u00e801lbwtcnz4ck', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 2.000 Diamonds', 'sos-2000', NULL, NULL, 294518, 329861, 318080, 309244, 303354, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.278', '2026-03-11 13:41:37.278');
INSERT INTO public."ProductSku" VALUES ('cmmm3861g00e901lb6kiw8edi', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 20.000 Diamonds', 'sos-20000', NULL, NULL, 2945670, 3299151, 3181324, 3092954, 3034041, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.3', '2026-03-11 13:41:37.3');
INSERT INTO public."ProductSku" VALUES ('cmmm3862400ea01lbqsuu24rl', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 500 Diamonds', 'sos-500', NULL, NULL, 73659, 82499, 79552, 77342, 75869, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.324', '2026-03-11 13:41:37.324');
INSERT INTO public."ProductSku" VALUES ('cmmm3862w00eb01lbo1tf1e41', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 5.000 Diamonds', 'sos-5000', NULL, NULL, 737567, 826076, 796573, 774446, 759695, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.352', '2026-03-11 13:41:37.352');
INSERT INTO public."ProductSku" VALUES ('cmmm3863m00ec01lb2i0nfr2r', 'cmmm385xl00e301lbuj1xf23w', 'cmmm2sm38000es0ojpyl0zxwk', 'State of Survival 50.000 Diamonds', 'sos-50000', NULL, NULL, 7369260, 8253572, 7958801, 7737723, 7590338, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.378', '2026-03-11 13:41:37.378');
INSERT INTO public."ProductSku" VALUES ('cmmm3865s00ef01lbc4oux8k6', 'cmmm3864u00ee01lb77kes8tx', 'cmmm2sm38000es0ojpyl0zxwk', 'Stumble Guys 120 Tokens', 'Stumble-Guys-120-Tokens', NULL, NULL, 31025, 34748, 33507, 32577, 31956, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.456', '2026-03-11 13:41:37.456');
INSERT INTO public."ProductSku" VALUES ('cmmm3866o00eg01lb3vo8gnof', 'cmmm3864u00ee01lb77kes8tx', 'cmmm2sm38000es0ojpyl0zxwk', 'Stumble Guys 1.300 Tokens', 'StumbleGuys-1300token', NULL, NULL, 346000, 387521, 373680, 363300, 356380, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.487', '2026-03-11 13:41:37.487');
INSERT INTO public."ProductSku" VALUES ('cmmm3867y00eh01lb82w86d1p', 'cmmm3864u00ee01lb77kes8tx', 'cmmm2sm38000es0ojpyl0zxwk', 'Stumble Guys 5.000 Gems dan 275 Tokens', 'StumbleGuys-275token', NULL, NULL, 102025, 114269, 110187, 107127, 105086, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.534', '2026-03-11 13:41:37.534');
INSERT INTO public."ProductSku" VALUES ('cmmm3869i00ei01lb2b102suq', 'cmmm3864u00ee01lb77kes8tx', 'cmmm2sm38000es0ojpyl0zxwk', 'Stumble Guys 1.600 Gems dan 75 Tokens', 'StumbleGuys-75token', NULL, NULL, 41025, 45949, 44307, 43077, 42256, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.59', '2026-03-11 13:41:37.59');
INSERT INTO public."ProductSku" VALUES ('cmmm386b900el01lby4wsd1gl', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 1.000 VP', 'v1000', NULL, NULL, 103581, 116011, 111868, 108761, 106689, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.652', '2026-03-11 13:41:37.652');
INSERT INTO public."ProductSku" VALUES ('cmmm386by00em01lbvhe4crp1', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 10.700 VP', 'v10700', NULL, NULL, 1035829, 1160129, 1118696, 1087621, 1066904, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.678', '2026-03-11 13:41:37.678');
INSERT INTO public."ProductSku" VALUES ('cmmm386cl00en01lbsjedgv21', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 11.000 VP', 'v11000', NULL, NULL, 1015300, 1137136, 1096524, 1066065, 1045759, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.701', '2026-03-11 13:41:37.701');
INSERT INTO public."ProductSku" VALUES ('cmmm386d800eo01lb7pyhs52j', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 11.100 VP', 'v11100', NULL, NULL, 1089847, 1220629, 1177035, 1144340, 1122543, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.724', '2026-03-11 13:41:37.724');
INSERT INTO public."ProductSku" VALUES ('cmmm386dv00ep01lbf4m6lhex', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 11.475 VP', 'v11475', NULL, NULL, 1070030, 1198434, 1155633, 1123532, 1102131, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.747', '2026-03-11 13:41:37.747');
INSERT INTO public."ProductSku" VALUES ('cmmm386ef00eq01lbbm8mrcft', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 12.000 VP', 'v12000', NULL, NULL, 1119717, 1254084, 1209295, 1175703, 1153309, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.767', '2026-03-11 13:41:37.767');
INSERT INTO public."ProductSku" VALUES ('cmmm386f000er01lbyb9luk04', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 13.050 VP', 'v13050', NULL, NULL, 1228139, 1375516, 1326391, 1289546, 1264984, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.788', '2026-03-11 13:41:37.788');
INSERT INTO public."ProductSku" VALUES ('cmmm386fp00es01lbmkclhmeg', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 14.650 VP', 'v14650', NULL, NULL, 1381308, 1547065, 1491813, 1450374, 1422748, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.813', '2026-03-11 13:41:37.813');
INSERT INTO public."ProductSku" VALUES ('cmmm386gb00et01lb29ygnljq', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 1.475 VP', 'v1475', NULL, NULL, 155359, 174003, 167788, 163127, 160020, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.835', '2026-03-11 13:41:37.835');
INSERT INTO public."ProductSku" VALUES ('cmmm386gz00eu01lbl8hbukif', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 2.000 VP', 'v2000', NULL, NULL, 207237, 232106, 223816, 217599, 213455, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.859', '2026-03-11 13:41:37.859');
INSERT INTO public."ProductSku" VALUES ('cmmm386hl00ev01lb04fbxmls', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 2.050 VP', 'v2050', NULL, NULL, 207136, 231993, 223707, 217493, 213351, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.881', '2026-03-11 13:41:37.881');
INSERT INTO public."ProductSku" VALUES ('cmmm386ia00ew01lb8w4s63t0', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 22.000 VP', 'v22000', NULL, NULL, 2040400, 2285248, 2203632, 2142420, 2101612, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.906', '2026-03-11 13:41:37.906');
INSERT INTO public."ProductSku" VALUES ('cmmm386iu00ex01lb11sjhfkk', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 2.525 VP', 'v2525', NULL, NULL, 258914, 289984, 279628, 271860, 266682, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.926', '2026-03-11 13:41:37.926');
INSERT INTO public."ProductSku" VALUES ('cmmm386jn00ey01lbzp2358xf', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 3.050 VP', 'v3050', NULL, NULL, 310692, 347976, 335548, 326227, 320013, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.955', '2026-03-11 13:41:37.955');
INSERT INTO public."ProductSku" VALUES ('cmmm386k700ez01lbub3e0jma', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 3.650 VP', 'v3650', NULL, NULL, 359400, 402529, 388152, 377370, 370182, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.975', '2026-03-11 13:41:37.975');
INSERT INTO public."ProductSku" VALUES ('cmmm386ku00f001lbnlose0d6', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 4.100 VP', 'v4100', NULL, NULL, 414930, 464722, 448125, 435677, 427378, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:37.998', '2026-03-11 13:41:37.998');
INSERT INTO public."ProductSku" VALUES ('cmmm386li00f101lbnizmrd2q', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 4.125 VP', 'v4125', NULL, NULL, 411573, 460962, 444499, 432152, 423921, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.022', '2026-03-11 13:41:38.022');
INSERT INTO public."ProductSku" VALUES ('cmmm386m400f201lbpn3u20u8', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 4.650 VP', 'v4650', NULL, NULL, 463251, 518842, 500312, 486414, 477149, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.044', '2026-03-11 13:41:38.044');
INSERT INTO public."ProductSku" VALUES ('cmmm386ms00f301lb6yg13b1t', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 475 VP', 'v475', NULL, NULL, 51750, 57961, 55891, 54338, 53303, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.068', '2026-03-11 13:41:38.068');
INSERT INTO public."ProductSku" VALUES ('cmmm386ni00f401lbf2u2gmgp', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 5.350 VP', 'v5350', NULL, NULL, 516877, 578903, 558228, 542721, 532384, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.094', '2026-03-11 13:41:38.094');
INSERT INTO public."ProductSku" VALUES ('cmmm386o800f501lbukf16nbp', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 5.700 VP', 'v5700', NULL, NULL, 566806, 634823, 612151, 595147, 583811, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.12', '2026-03-11 13:41:38.12');
INSERT INTO public."ProductSku" VALUES ('cmmm386ox00f601lb8hjgtenn', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 5.825 VP', 'v5825', NULL, NULL, 568755, 637006, 614256, 597193, 585818, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.145', '2026-03-11 13:41:38.145');
INSERT INTO public."ProductSku" VALUES ('cmmm386pk00f701lbrlufhwl2', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 6.350 VP', 'v6350', NULL, NULL, 620533, 694997, 670176, 651560, 639149, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.168', '2026-03-11 13:41:38.168');
INSERT INTO public."ProductSku" VALUES ('cmmm386q600f801lbyy8p6u2i', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 7.300 VP', 'v7300', NULL, NULL, 720465, 806921, 778103, 756489, 742079, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.19', '2026-03-11 13:41:38.19');
INSERT INTO public."ProductSku" VALUES ('cmmm386qx00f901lbnxxhgwqv', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 7.400 VP', 'v7400', NULL, NULL, 724088, 810979, 782016, 760293, 745811, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.216', '2026-03-11 13:41:38.216');
INSERT INTO public."ProductSku" VALUES ('cmmm386rs00fa01lbug48yyof', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 8.990 VP', 'v8990', NULL, NULL, 876647, 981845, 946779, 920480, 902947, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.248', '2026-03-11 13:41:38.248');
INSERT INTO public."ProductSku" VALUES ('cmmm386se00fb01lb43nu06ns', 'cmmm386aj00ek01lbdd64wqlu', 'cmmm2sm38000es0ojpyl0zxwk', 'Valorant 950 VP', 'v950', NULL, NULL, 103681, 116123, 111976, 108866, 106792, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.27', '2026-03-11 13:41:38.27');
INSERT INTO public."ProductSku" VALUES ('cmmm386t100fc01lbrhgr8mio', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE Weekly Deal Pack 1', 'wd-1', NULL, NULL, 15069, 16878, 16275, 15823, 15522, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.293', '2026-03-11 13:41:38.293');
INSERT INTO public."ProductSku" VALUES ('cmmm386tn00fd01lbwe5lfugx', 'cmmm37y16002q01lbalbhvot4', 'cmmm2sm38000es0ojpyl0zxwk', 'PUBG MOBILE Weekly Deal Pack 2', 'wd-2', NULL, NULL, 45070, 50479, 48676, 47324, 46423, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:38.315', '2026-03-11 13:41:38.315');
INSERT INTO public."ProductSku" VALUES ('cmmm37wwz001401lbewg13wcy', 'cmmm37wrx000y01lbwe1ulqbp', 'cmmm2sm38000es0ojpyl0zxwk', 'AOV 40 Vouchers', 'aov-40vcr', NULL, NULL, 9093, 10185, 9821, 9548, 9366, 12, 8, 5, 3, -1, 'ACTIVE', 0, NULL, '2026-03-11 13:41:25.475', '2026-03-11 13:43:06.728');


--
-- TOC entry 4639 (class 0 OID 245159)
-- Dependencies: 254
-- Data for Name: PromoCode; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4640 (class 0 OID 245182)
-- Dependencies: 255
-- Data for Name: PromoUsage; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4651 (class 0 OID 245368)
-- Dependencies: 266
-- Data for Name: PushNotificationLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4636 (class 0 OID 245111)
-- Dependencies: 251
-- Data for Name: ReferralReward; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4662 (class 0 OID 245545)
-- Dependencies: 277
-- Data for Name: RefundPolicy; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4645 (class 0 OID 245268)
-- Dependencies: 260
-- Data for Name: SubscriptionHistory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4614 (class 0 OID 244694)
-- Dependencies: 229
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Supplier" VALUES ('cmmm2sm38000es0ojpyl0zxwk', 'Digiflazz (Sandbox)', 'DIGIFLAZZ', 'https://api.digiflazz.com/v1', 'dummy_key', 'dummy_secret', 'ACTIVE', 0, '2026-03-11 15:00:00.605', '2026-03-11 13:29:31.604', '2026-03-11 15:00:00.609');


--
-- TOC entry 4616 (class 0 OID 244728)
-- Dependencies: 231
-- Data for Name: SupplierBalanceHistory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4615 (class 0 OID 244714)
-- Dependencies: 230
-- Data for Name: SupplierLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4658 (class 0 OID 245475)
-- Dependencies: 273
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4659 (class 0 OID 245495)
-- Dependencies: 274
-- Data for Name: SupportTicketReply; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4666 (class 0 OID 245616)
-- Dependencies: 281
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4621 (class 0 OID 244840)
-- Dependencies: 236
-- Data for Name: TierPriceHistory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4620 (class 0 OID 244814)
-- Dependencies: 235
-- Data for Name: TierPricingRule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4604 (class 0 OID 244539)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('cmmm2sm0p0000s0oj0afl3s24', 'superadmin@dagangplay.com', '080000000000', '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'System Super Admin', NULL, NULL, 'SUPER_ADMIN', 'ACTIVE', '[]', true, NULL, 'SUPERADMIN', NULL, NULL, 0, 0, '2026-03-11 13:29:31.513', '2026-03-11 13:29:31.513', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm170001s0oj1yu9qrrw', 'fantasi@m.com', '08193727714', '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Owner Fantasi Gamer', NULL, NULL, 'MERCHANT', 'ACTIVE', '[]', false, NULL, 'FANTASIGAMER', NULL, NULL, 0, 0, '2026-03-11 13:29:31.531', '2026-03-11 13:29:31.531', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm1j0003s0oja163dws3', 'arb@m.com', '081952030729', '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Owner Arb Store', NULL, NULL, 'MERCHANT', 'ACTIVE', '[]', false, NULL, 'ARBSTORE', NULL, NULL, 0, 0, '2026-03-11 13:29:31.543', '2026-03-11 13:29:31.543', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm1q0005s0ojuuivxd0x', 'rolly@m.com', '081708791972', '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Owner Rolly Store', NULL, NULL, 'MERCHANT', 'ACTIVE', '[]', false, NULL, 'ROLLYSTORE', NULL, NULL, 0, 0, '2026-03-11 13:29:31.55', '2026-03-11 13:29:31.55', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm1x0007s0ojr3uywtdy', 'budi@m.com', '081532157522', '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Owner Budi Gaming', NULL, NULL, 'MERCHANT', 'ACTIVE', '[]', false, NULL, 'BUDIGAMING', NULL, NULL, 0, 0, '2026-03-11 13:29:31.557', '2026-03-11 13:29:31.557', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm2b0009s0oj6cgli5sx', 'joko@c.com', NULL, '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Joko Widodo', NULL, NULL, 'CUSTOMER', 'ACTIVE', '[]', false, NULL, 'CUST4043', NULL, NULL, 0, 0, '2026-03-11 13:29:31.571', '2026-03-11 13:29:31.571', NULL);
INSERT INTO public."User" VALUES ('cmmm2sm2j000as0oj7yahs01t', 'agus@c.com', NULL, '$2b$10$dVftDJWCgYc1cr0mhI4UxuxN188Itx665DiGT/uM0FIocr.15MKkK', 'Agus Setiawan', NULL, NULL, 'CUSTOMER', 'ACTIVE', '[]', false, NULL, 'CUST7735', NULL, NULL, 0, 0, '2026-03-11 13:29:31.579', '2026-03-11 13:29:31.579', NULL);


--
-- TOC entry 4648 (class 0 OID 245324)
-- Dependencies: 263
-- Data for Name: UserActivityLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4657 (class 0 OID 245463)
-- Dependencies: 272
-- Data for Name: UserFavorite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4605 (class 0 OID 244564)
-- Dependencies: 220
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4606 (class 0 OID 244576)
-- Dependencies: 221
-- Data for Name: UserSession; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4642 (class 0 OID 245213)
-- Dependencies: 257
-- Data for Name: WebhookEndpoint; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4643 (class 0 OID 245230)
-- Dependencies: 258
-- Data for Name: WebhookLog; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4633 (class 0 OID 245054)
-- Dependencies: 248
-- Data for Name: Withdrawal; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4304 (class 2606 OID 245430)
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- TOC entry 4261 (class 2606 OID 245212)
-- Name: ApiKey ApiKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY (id);


--
-- TOC entry 4337 (class 2606 OID 245615)
-- Name: ApiRateLimit ApiRateLimit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiRateLimit"
    ADD CONSTRAINT "ApiRateLimit_pkey" PRIMARY KEY (id);


--
-- TOC entry 4347 (class 2606 OID 245654)
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4229 (class 2606 OID 245053)
-- Name: BalanceTransaction BalanceTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BalanceTransaction"
    ADD CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY (id);


--
-- TOC entry 4301 (class 2606 OID 245415)
-- Name: Banner Banner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_pkey" PRIMARY KEY (id);


--
-- TOC entry 4177 (class 2606 OID 244759)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 4358 (class 2606 OID 246268)
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4355 (class 2606 OID 246251)
-- Name: ChatRoom ChatRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY (id);


--
-- TOC entry 4237 (class 2606 OID 245093)
-- Name: CommissionRule CommissionRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionRule"
    ADD CONSTRAINT "CommissionRule_pkey" PRIMARY KEY (id);


--
-- TOC entry 4240 (class 2606 OID 245110)
-- Name: Commission Commission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commission"
    ADD CONSTRAINT "Commission_pkey" PRIMARY KEY (id);


--
-- TOC entry 4279 (class 2606 OID 245306)
-- Name: DailySalesSnapshot DailySalesSnapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailySalesSnapshot"
    ADD CONSTRAINT "DailySalesSnapshot_pkey" PRIMARY KEY (id);


--
-- TOC entry 4225 (class 2606 OID 245038)
-- Name: Deposit Deposit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY (id);


--
-- TOC entry 4154 (class 2606 OID 244658)
-- Name: DeviceTrusted DeviceTrusted_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DeviceTrusted"
    ADD CONSTRAINT "DeviceTrusted_pkey" PRIMARY KEY (id);


--
-- TOC entry 4332 (class 2606 OID 245576)
-- Name: DisputeCase DisputeCase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DisputeCase"
    ADD CONSTRAINT "DisputeCase_pkey" PRIMARY KEY (id);


--
-- TOC entry 4247 (class 2606 OID 245141)
-- Name: DownlineTree DownlineTree_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownlineTree"
    ADD CONSTRAINT "DownlineTree_pkey" PRIMARY KEY (id);


--
-- TOC entry 4298 (class 2606 OID 245394)
-- Name: EmailCampaignLog EmailCampaignLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailCampaignLog"
    ADD CONSTRAINT "EmailCampaignLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4309 (class 2606 OID 245462)
-- Name: EmailCampaign EmailCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailCampaign"
    ADD CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY (id);


--
-- TOC entry 4148 (class 2606 OID 244634)
-- Name: FraudDetection FraudDetection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FraudDetection"
    ADD CONSTRAINT "FraudDetection_pkey" PRIMARY KEY (id);


--
-- TOC entry 4207 (class 2606 OID 244935)
-- Name: GameNickname GameNickname_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameNickname"
    ADD CONSTRAINT "GameNickname_pkey" PRIMARY KEY (id);


--
-- TOC entry 4200 (class 2606 OID 244908)
-- Name: GameServer GameServer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameServer"
    ADD CONSTRAINT "GameServer_pkey" PRIMARY KEY (id);


--
-- TOC entry 4204 (class 2606 OID 244921)
-- Name: GameValidation GameValidation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameValidation"
    ADD CONSTRAINT "GameValidation_pkey" PRIMARY KEY (id);


--
-- TOC entry 4146 (class 2606 OID 244619)
-- Name: IPBlacklist IPBlacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IPBlacklist"
    ADD CONSTRAINT "IPBlacklist_pkey" PRIMARY KEY (id);


--
-- TOC entry 4272 (class 2606 OID 245267)
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- TOC entry 4334 (class 2606 OID 245596)
-- Name: JobQueue JobQueue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobQueue"
    ADD CONSTRAINT "JobQueue_pkey" PRIMARY KEY (id);


--
-- TOC entry 4151 (class 2606 OID 244646)
-- Name: LoginAttempt LoginAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY (id);


--
-- TOC entry 4250 (class 2606 OID 245158)
-- Name: MLMCommission MLMCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MLMCommission"
    ADD CONSTRAINT "MLMCommission_pkey" PRIMARY KEY (id);


--
-- TOC entry 4325 (class 2606 OID 245544)
-- Name: MaintenanceSchedule MaintenanceSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceSchedule"
    ADD CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY (id);


--
-- TOC entry 4350 (class 2606 OID 246230)
-- Name: MarketingGuide MarketingGuide_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MarketingGuide"
    ADD CONSTRAINT "MarketingGuide_pkey" PRIMARY KEY (id);


--
-- TOC entry 4166 (class 2606 OID 244693)
-- Name: MerchantMember MerchantMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantMember"
    ADD CONSTRAINT "MerchantMember_pkey" PRIMARY KEY (id);


--
-- TOC entry 4361 (class 2606 OID 246296)
-- Name: MerchantProductOverride MerchantProductOverride_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductOverride"
    ADD CONSTRAINT "MerchantProductOverride_pkey" PRIMARY KEY (id);


--
-- TOC entry 4198 (class 2606 OID 244893)
-- Name: MerchantProductPrice MerchantProductPrice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductPrice"
    ADD CONSTRAINT "MerchantProductPrice_pkey" PRIMARY KEY (id);


--
-- TOC entry 4345 (class 2606 OID 245642)
-- Name: MerchantSetting MerchantSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantSetting"
    ADD CONSTRAINT "MerchantSetting_pkey" PRIMARY KEY (id);


--
-- TOC entry 4160 (class 2606 OID 244678)
-- Name: Merchant Merchant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Merchant"
    ADD CONSTRAINT "Merchant_pkey" PRIMARY KEY (id);


--
-- TOC entry 4292 (class 2606 OID 245367)
-- Name: NotificationTemplate NotificationTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NotificationTemplate"
    ADD CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY (id);


--
-- TOC entry 4288 (class 2606 OID 245351)
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- TOC entry 4216 (class 2606 OID 244979)
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 4212 (class 2606 OID 244966)
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- TOC entry 4140 (class 2606 OID 244606)
-- Name: OtpVerification OtpVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OtpVerification"
    ADD CONSTRAINT "OtpVerification_pkey" PRIMARY KEY (id);


--
-- TOC entry 4223 (class 2606 OID 245021)
-- Name: PaymentChannel PaymentChannel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentChannel"
    ADD CONSTRAINT "PaymentChannel_pkey" PRIMARY KEY (id);


--
-- TOC entry 4220 (class 2606 OID 245000)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4193 (class 2606 OID 244876)
-- Name: PlanTierMapping PlanTierMapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlanTierMapping"
    ADD CONSTRAINT "PlanTierMapping_pkey" PRIMARY KEY (id);


--
-- TOC entry 4306 (class 2606 OID 245444)
-- Name: PopupPromo PopupPromo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PopupPromo"
    ADD CONSTRAINT "PopupPromo_pkey" PRIMARY KEY (id);


--
-- TOC entry 4322 (class 2606 OID 245528)
-- Name: ProductReview ProductReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductReview"
    ADD CONSTRAINT "ProductReview_pkey" PRIMARY KEY (id);


--
-- TOC entry 4281 (class 2606 OID 245323)
-- Name: ProductSalesStats ProductSalesStats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSalesStats"
    ADD CONSTRAINT "ProductSalesStats_pkey" PRIMARY KEY (id);


--
-- TOC entry 4184 (class 2606 OID 244813)
-- Name: ProductSku ProductSku_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSku"
    ADD CONSTRAINT "ProductSku_pkey" PRIMARY KEY (id);


--
-- TOC entry 4181 (class 2606 OID 244783)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 4254 (class 2606 OID 245181)
-- Name: PromoCode PromoCode_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_pkey" PRIMARY KEY (id);


--
-- TOC entry 4256 (class 2606 OID 245195)
-- Name: PromoUsage PromoUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoUsage"
    ADD CONSTRAINT "PromoUsage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4294 (class 2606 OID 245381)
-- Name: PushNotificationLog PushNotificationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushNotificationLog"
    ADD CONSTRAINT "PushNotificationLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4242 (class 2606 OID 245127)
-- Name: ReferralReward ReferralReward_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralReward"
    ADD CONSTRAINT "ReferralReward_pkey" PRIMARY KEY (id);


--
-- TOC entry 4328 (class 2606 OID 245560)
-- Name: RefundPolicy RefundPolicy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundPolicy"
    ADD CONSTRAINT "RefundPolicy_pkey" PRIMARY KEY (id);


--
-- TOC entry 4275 (class 2606 OID 245282)
-- Name: SubscriptionHistory SubscriptionHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubscriptionHistory"
    ADD CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 4174 (class 2606 OID 244742)
-- Name: SupplierBalanceHistory SupplierBalanceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierBalanceHistory"
    ADD CONSTRAINT "SupplierBalanceHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 4171 (class 2606 OID 244727)
-- Name: SupplierLog SupplierLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierLog"
    ADD CONSTRAINT "SupplierLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4169 (class 2606 OID 244713)
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- TOC entry 4318 (class 2606 OID 245509)
-- Name: SupportTicketReply SupportTicketReply_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicketReply"
    ADD CONSTRAINT "SupportTicketReply_pkey" PRIMARY KEY (id);


--
-- TOC entry 4315 (class 2606 OID 245494)
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- TOC entry 4341 (class 2606 OID 245628)
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- TOC entry 4190 (class 2606 OID 244862)
-- Name: TierPriceHistory TierPriceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TierPriceHistory"
    ADD CONSTRAINT "TierPriceHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 4188 (class 2606 OID 244839)
-- Name: TierPricingRule TierPricingRule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TierPricingRule"
    ADD CONSTRAINT "TierPricingRule_pkey" PRIMARY KEY (id);


--
-- TOC entry 4285 (class 2606 OID 245335)
-- Name: UserActivityLog UserActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserActivityLog"
    ADD CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4311 (class 2606 OID 245474)
-- Name: UserFavorite UserFavorite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavorite"
    ADD CONSTRAINT "UserFavorite_pkey" PRIMARY KEY (id);


--
-- TOC entry 4132 (class 2606 OID 244575)
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- TOC entry 4135 (class 2606 OID 244591)
-- Name: UserSession UserSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_pkey" PRIMARY KEY (id);


--
-- TOC entry 4128 (class 2606 OID 244563)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4265 (class 2606 OID 245229)
-- Name: WebhookEndpoint WebhookEndpoint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookEndpoint"
    ADD CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY (id);


--
-- TOC entry 4267 (class 2606 OID 245246)
-- Name: WebhookLog WebhookLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_pkey" PRIMARY KEY (id);


--
-- TOC entry 4233 (class 2606 OID 245074)
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- TOC entry 4302 (class 1259 OID 245733)
-- Name: Announcement_merchantId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Announcement_merchantId_isActive_idx" ON public."Announcement" USING btree ("merchantId", "isActive");


--
-- TOC entry 4259 (class 1259 OID 245716)
-- Name: ApiKey_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ApiKey_key_key" ON public."ApiKey" USING btree (key);


--
-- TOC entry 4262 (class 1259 OID 245717)
-- Name: ApiKey_userId_merchantId_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiKey_userId_merchantId_key_idx" ON public."ApiKey" USING btree ("userId", "merchantId", key);


--
-- TOC entry 4338 (class 1259 OID 245745)
-- Name: ApiRateLimit_userId_ipAddress_endpoint_windowStart_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApiRateLimit_userId_ipAddress_endpoint_windowStart_idx" ON public."ApiRateLimit" USING btree ("userId", "ipAddress", endpoint, "windowStart");


--
-- TOC entry 4348 (class 1259 OID 245749)
-- Name: AuditLog_userId_merchantId_action_entity_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AuditLog_userId_merchantId_action_entity_createdAt_idx" ON public."AuditLog" USING btree ("userId", "merchantId", action, entity, "createdAt");


--
-- TOC entry 4227 (class 1259 OID 245702)
-- Name: BalanceTransaction_depositId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BalanceTransaction_depositId_key" ON public."BalanceTransaction" USING btree ("depositId");


--
-- TOC entry 4230 (class 1259 OID 245704)
-- Name: BalanceTransaction_userId_type_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "BalanceTransaction_userId_type_createdAt_idx" ON public."BalanceTransaction" USING btree ("userId", type, "createdAt");


--
-- TOC entry 4231 (class 1259 OID 245703)
-- Name: BalanceTransaction_withdrawalId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "BalanceTransaction_withdrawalId_key" ON public."BalanceTransaction" USING btree ("withdrawalId");


--
-- TOC entry 4299 (class 1259 OID 245732)
-- Name: Banner_merchantId_position_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Banner_merchantId_position_isActive_idx" ON public."Banner" USING btree ("merchantId", "position", "isActive");


--
-- TOC entry 4178 (class 1259 OID 245682)
-- Name: Category_slug_isActive_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Category_slug_isActive_parentId_idx" ON public."Category" USING btree (slug, "isActive", "parentId");


--
-- TOC entry 4179 (class 1259 OID 245681)
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- TOC entry 4356 (class 1259 OID 246270)
-- Name: ChatMessage_chatRoomId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChatMessage_chatRoomId_createdAt_idx" ON public."ChatMessage" USING btree ("chatRoomId", "createdAt");


--
-- TOC entry 4353 (class 1259 OID 246269)
-- Name: ChatRoom_merchantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ChatRoom_merchantId_key" ON public."ChatRoom" USING btree ("merchantId");


--
-- TOC entry 4235 (class 1259 OID 245706)
-- Name: CommissionRule_merchantId_forRole_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CommissionRule_merchantId_forRole_isActive_idx" ON public."CommissionRule" USING btree ("merchantId", "forRole", "isActive");


--
-- TOC entry 4238 (class 1259 OID 245707)
-- Name: Commission_orderId_userId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Commission_orderId_userId_status_idx" ON public."Commission" USING btree ("orderId", "userId", status);


--
-- TOC entry 4276 (class 1259 OID 245723)
-- Name: DailySalesSnapshot_merchantId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DailySalesSnapshot_merchantId_date_idx" ON public."DailySalesSnapshot" USING btree ("merchantId", date);


--
-- TOC entry 4277 (class 1259 OID 245724)
-- Name: DailySalesSnapshot_merchantId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DailySalesSnapshot_merchantId_date_key" ON public."DailySalesSnapshot" USING btree ("merchantId", date);


--
-- TOC entry 4226 (class 1259 OID 245701)
-- Name: Deposit_userId_merchantId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Deposit_userId_merchantId_status_createdAt_idx" ON public."Deposit" USING btree ("userId", "merchantId", status, "createdAt");


--
-- TOC entry 4155 (class 1259 OID 245671)
-- Name: DeviceTrusted_userId_deviceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DeviceTrusted_userId_deviceId_key" ON public."DeviceTrusted" USING btree ("userId", "deviceId");


--
-- TOC entry 4156 (class 1259 OID 245670)
-- Name: DeviceTrusted_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DeviceTrusted_userId_idx" ON public."DeviceTrusted" USING btree ("userId");


--
-- TOC entry 4330 (class 1259 OID 245743)
-- Name: DisputeCase_orderId_userId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DisputeCase_orderId_userId_status_idx" ON public."DisputeCase" USING btree ("orderId", "userId", status);


--
-- TOC entry 4244 (class 1259 OID 245710)
-- Name: DownlineTree_parentId_childId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DownlineTree_parentId_childId_key" ON public."DownlineTree" USING btree ("parentId", "childId");


--
-- TOC entry 4245 (class 1259 OID 245709)
-- Name: DownlineTree_parentId_childId_level_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DownlineTree_parentId_childId_level_idx" ON public."DownlineTree" USING btree ("parentId", "childId", level);


--
-- TOC entry 4296 (class 1259 OID 245731)
-- Name: EmailCampaignLog_campaignId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmailCampaignLog_campaignId_userId_idx" ON public."EmailCampaignLog" USING btree ("campaignId", "userId");


--
-- TOC entry 4307 (class 1259 OID 245734)
-- Name: EmailCampaign_merchantId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "EmailCampaign_merchantId_isActive_idx" ON public."EmailCampaign" USING btree ("merchantId", "isActive");


--
-- TOC entry 4149 (class 1259 OID 245668)
-- Name: FraudDetection_userId_riskLevel_isResolved_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "FraudDetection_userId_riskLevel_isResolved_idx" ON public."FraudDetection" USING btree ("userId", "riskLevel", "isResolved");


--
-- TOC entry 4208 (class 1259 OID 245693)
-- Name: GameNickname_productId_gameUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameNickname_productId_gameUserId_idx" ON public."GameNickname" USING btree ("productId", "gameUserId");


--
-- TOC entry 4209 (class 1259 OID 245694)
-- Name: GameNickname_productId_gameUserId_serverId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GameNickname_productId_gameUserId_serverId_key" ON public."GameNickname" USING btree ("productId", "gameUserId", "serverId");


--
-- TOC entry 4201 (class 1259 OID 245690)
-- Name: GameServer_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameServer_productId_idx" ON public."GameServer" USING btree ("productId");


--
-- TOC entry 4202 (class 1259 OID 245691)
-- Name: GameServer_productId_serverId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GameServer_productId_serverId_key" ON public."GameServer" USING btree ("productId", "serverId");


--
-- TOC entry 4205 (class 1259 OID 245692)
-- Name: GameValidation_productId_gameUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GameValidation_productId_gameUserId_idx" ON public."GameValidation" USING btree ("productId", "gameUserId");


--
-- TOC entry 4143 (class 1259 OID 245667)
-- Name: IPBlacklist_ipAddress_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IPBlacklist_ipAddress_idx" ON public."IPBlacklist" USING btree ("ipAddress");


--
-- TOC entry 4144 (class 1259 OID 245666)
-- Name: IPBlacklist_ipAddress_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IPBlacklist_ipAddress_key" ON public."IPBlacklist" USING btree ("ipAddress");


--
-- TOC entry 4269 (class 1259 OID 245720)
-- Name: Invoice_invoiceNo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON public."Invoice" USING btree ("invoiceNo");


--
-- TOC entry 4270 (class 1259 OID 245721)
-- Name: Invoice_merchantId_status_dueDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_merchantId_status_dueDate_idx" ON public."Invoice" USING btree ("merchantId", status, "dueDate");


--
-- TOC entry 4335 (class 1259 OID 245744)
-- Name: JobQueue_type_status_scheduledAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobQueue_type_status_scheduledAt_idx" ON public."JobQueue" USING btree (type, status, "scheduledAt");


--
-- TOC entry 4152 (class 1259 OID 245669)
-- Name: LoginAttempt_userId_ipAddress_isSuccess_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LoginAttempt_userId_ipAddress_isSuccess_createdAt_idx" ON public."LoginAttempt" USING btree ("userId", "ipAddress", "isSuccess", "createdAt");


--
-- TOC entry 4248 (class 1259 OID 245711)
-- Name: MLMCommission_orderId_userId_level_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MLMCommission_orderId_userId_level_status_idx" ON public."MLMCommission" USING btree ("orderId", "userId", level, status);


--
-- TOC entry 4326 (class 1259 OID 245741)
-- Name: MaintenanceSchedule_supplierId_productId_startTime_endTime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceSchedule_supplierId_productId_startTime_endTime_idx" ON public."MaintenanceSchedule" USING btree ("supplierId", "productId", "startTime", "endTime");


--
-- TOC entry 4351 (class 1259 OID 246231)
-- Name: MarketingGuide_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MarketingGuide_slug_key" ON public."MarketingGuide" USING btree (slug);


--
-- TOC entry 4352 (class 1259 OID 246232)
-- Name: MarketingGuide_targetPlan_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MarketingGuide_targetPlan_isActive_idx" ON public."MarketingGuide" USING btree ("targetPlan", "isActive");


--
-- TOC entry 4163 (class 1259 OID 245676)
-- Name: MerchantMember_merchantId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MerchantMember_merchantId_userId_idx" ON public."MerchantMember" USING btree ("merchantId", "userId");


--
-- TOC entry 4164 (class 1259 OID 245677)
-- Name: MerchantMember_merchantId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MerchantMember_merchantId_userId_key" ON public."MerchantMember" USING btree ("merchantId", "userId");


--
-- TOC entry 4359 (class 1259 OID 246297)
-- Name: MerchantProductOverride_merchantId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MerchantProductOverride_merchantId_productId_key" ON public."MerchantProductOverride" USING btree ("merchantId", "productId");


--
-- TOC entry 4195 (class 1259 OID 245688)
-- Name: MerchantProductPrice_merchantId_productSkuId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MerchantProductPrice_merchantId_productSkuId_isActive_idx" ON public."MerchantProductPrice" USING btree ("merchantId", "productSkuId", "isActive");


--
-- TOC entry 4196 (class 1259 OID 245689)
-- Name: MerchantProductPrice_merchantId_productSkuId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MerchantProductPrice_merchantId_productSkuId_key" ON public."MerchantProductPrice" USING btree ("merchantId", "productSkuId");


--
-- TOC entry 4342 (class 1259 OID 245747)
-- Name: MerchantSetting_merchantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MerchantSetting_merchantId_idx" ON public."MerchantSetting" USING btree ("merchantId");


--
-- TOC entry 4343 (class 1259 OID 245748)
-- Name: MerchantSetting_merchantId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MerchantSetting_merchantId_key_key" ON public."MerchantSetting" USING btree ("merchantId", key);


--
-- TOC entry 4157 (class 1259 OID 245673)
-- Name: Merchant_domain_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Merchant_domain_key" ON public."Merchant" USING btree (domain);


--
-- TOC entry 4158 (class 1259 OID 245674)
-- Name: Merchant_ownerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Merchant_ownerId_key" ON public."Merchant" USING btree ("ownerId");


--
-- TOC entry 4161 (class 1259 OID 245675)
-- Name: Merchant_slug_domain_status_plan_isOfficial_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Merchant_slug_domain_status_plan_isOfficial_idx" ON public."Merchant" USING btree (slug, domain, status, plan, "isOfficial");


--
-- TOC entry 4162 (class 1259 OID 245672)
-- Name: Merchant_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Merchant_slug_key" ON public."Merchant" USING btree (slug);


--
-- TOC entry 4290 (class 1259 OID 245729)
-- Name: NotificationTemplate_merchantId_type_channel_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "NotificationTemplate_merchantId_type_channel_key" ON public."NotificationTemplate" USING btree ("merchantId", type, channel);


--
-- TOC entry 4289 (class 1259 OID 245728)
-- Name: Notification_userId_merchantId_isRead_type_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_merchantId_isRead_type_createdAt_idx" ON public."Notification" USING btree ("userId", "merchantId", "isRead", type, "createdAt");


--
-- TOC entry 4214 (class 1259 OID 245697)
-- Name: OrderStatusHistory_orderId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON public."OrderStatusHistory" USING btree ("orderId", "createdAt");


--
-- TOC entry 4210 (class 1259 OID 245695)
-- Name: Order_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Order_orderNumber_key" ON public."Order" USING btree ("orderNumber");


--
-- TOC entry 4213 (class 1259 OID 245696)
-- Name: Order_userId_merchantId_paymentStatus_fulfillmentStatus_cre_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Order_userId_merchantId_paymentStatus_fulfillmentStatus_cre_idx" ON public."Order" USING btree ("userId", "merchantId", "paymentStatus", "fulfillmentStatus", "createdAt");


--
-- TOC entry 4141 (class 1259 OID 245664)
-- Name: OtpVerification_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OtpVerification_token_key" ON public."OtpVerification" USING btree (token);


--
-- TOC entry 4142 (class 1259 OID 245665)
-- Name: OtpVerification_userId_token_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OtpVerification_userId_token_type_idx" ON public."OtpVerification" USING btree ("userId", token, type);


--
-- TOC entry 4221 (class 1259 OID 245700)
-- Name: PaymentChannel_merchantId_method_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PaymentChannel_merchantId_method_isActive_idx" ON public."PaymentChannel" USING btree ("merchantId", method, "isActive");


--
-- TOC entry 4217 (class 1259 OID 245698)
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- TOC entry 4218 (class 1259 OID 245699)
-- Name: Payment_orderId_userId_merchantId_status_tripayReference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Payment_orderId_userId_merchantId_status_tripayReference_idx" ON public."Payment" USING btree ("orderId", "userId", "merchantId", status, "tripayReference");


--
-- TOC entry 4194 (class 1259 OID 245687)
-- Name: PlanTierMapping_plan_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PlanTierMapping_plan_key" ON public."PlanTierMapping" USING btree (plan);


--
-- TOC entry 4320 (class 1259 OID 245739)
-- Name: ProductReview_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProductReview_orderId_key" ON public."ProductReview" USING btree ("orderId");


--
-- TOC entry 4323 (class 1259 OID 245740)
-- Name: ProductReview_productId_userId_rating_isPublished_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductReview_productId_userId_rating_isPublished_idx" ON public."ProductReview" USING btree ("productId", "userId", rating, "isPublished");


--
-- TOC entry 4282 (class 1259 OID 245725)
-- Name: ProductSalesStats_productId_categoryId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductSalesStats_productId_categoryId_date_idx" ON public."ProductSalesStats" USING btree ("productId", "categoryId", date);


--
-- TOC entry 4283 (class 1259 OID 245726)
-- Name: ProductSalesStats_productId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProductSalesStats_productId_date_key" ON public."ProductSalesStats" USING btree ("productId", date);


--
-- TOC entry 4185 (class 1259 OID 245684)
-- Name: ProductSku_productId_supplierId_status_supplierCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductSku_productId_supplierId_status_supplierCode_idx" ON public."ProductSku" USING btree ("productId", "supplierId", status, "supplierCode");


--
-- TOC entry 4182 (class 1259 OID 245683)
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- TOC entry 4251 (class 1259 OID 245712)
-- Name: PromoCode_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PromoCode_code_key" ON public."PromoCode" USING btree (code);


--
-- TOC entry 4252 (class 1259 OID 245713)
-- Name: PromoCode_code_merchantId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PromoCode_code_merchantId_isActive_idx" ON public."PromoCode" USING btree (code, "merchantId", "isActive");


--
-- TOC entry 4257 (class 1259 OID 245715)
-- Name: PromoUsage_promoCodeId_orderId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PromoUsage_promoCodeId_orderId_key" ON public."PromoUsage" USING btree ("promoCodeId", "orderId");


--
-- TOC entry 4258 (class 1259 OID 245714)
-- Name: PromoUsage_promoCodeId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PromoUsage_promoCodeId_userId_idx" ON public."PromoUsage" USING btree ("promoCodeId", "userId");


--
-- TOC entry 4295 (class 1259 OID 245730)
-- Name: PushNotificationLog_userId_isSuccess_sentAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PushNotificationLog_userId_isSuccess_sentAt_idx" ON public."PushNotificationLog" USING btree ("userId", "isSuccess", "sentAt");


--
-- TOC entry 4243 (class 1259 OID 245708)
-- Name: ReferralReward_referrerId_referredId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ReferralReward_referrerId_referredId_status_idx" ON public."ReferralReward" USING btree ("referrerId", "referredId", status);


--
-- TOC entry 4329 (class 1259 OID 245742)
-- Name: RefundPolicy_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "RefundPolicy_productId_key" ON public."RefundPolicy" USING btree ("productId");


--
-- TOC entry 4273 (class 1259 OID 245722)
-- Name: SubscriptionHistory_merchantId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SubscriptionHistory_merchantId_createdAt_idx" ON public."SubscriptionHistory" USING btree ("merchantId", "createdAt");


--
-- TOC entry 4175 (class 1259 OID 245680)
-- Name: SupplierBalanceHistory_supplierId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierBalanceHistory_supplierId_createdAt_idx" ON public."SupplierBalanceHistory" USING btree ("supplierId", "createdAt");


--
-- TOC entry 4172 (class 1259 OID 245679)
-- Name: SupplierLog_supplierId_orderId_isSuccess_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupplierLog_supplierId_orderId_isSuccess_createdAt_idx" ON public."SupplierLog" USING btree ("supplierId", "orderId", "isSuccess", "createdAt");


--
-- TOC entry 4167 (class 1259 OID 245678)
-- Name: Supplier_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Supplier_code_key" ON public."Supplier" USING btree (code);


--
-- TOC entry 4319 (class 1259 OID 245738)
-- Name: SupportTicketReply_ticketId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicketReply_ticketId_userId_idx" ON public."SupportTicketReply" USING btree ("ticketId", "userId");


--
-- TOC entry 4316 (class 1259 OID 245737)
-- Name: SupportTicket_userId_merchantId_status_priority_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SupportTicket_userId_merchantId_status_priority_createdAt_idx" ON public."SupportTicket" USING btree ("userId", "merchantId", status, priority, "createdAt");


--
-- TOC entry 4339 (class 1259 OID 245746)
-- Name: SystemSetting_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SystemSetting_key_key" ON public."SystemSetting" USING btree (key);


--
-- TOC entry 4191 (class 1259 OID 245686)
-- Name: TierPriceHistory_productSkuId_changeType_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TierPriceHistory_productSkuId_changeType_createdAt_idx" ON public."TierPriceHistory" USING btree ("productSkuId", "changeType", "createdAt");


--
-- TOC entry 4186 (class 1259 OID 245685)
-- Name: TierPricingRule_categoryId_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TierPricingRule_categoryId_isActive_idx" ON public."TierPricingRule" USING btree ("categoryId", "isActive");


--
-- TOC entry 4286 (class 1259 OID 245727)
-- Name: UserActivityLog_userId_action_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserActivityLog_userId_action_createdAt_idx" ON public."UserActivityLog" USING btree ("userId", action, "createdAt");


--
-- TOC entry 4312 (class 1259 OID 245735)
-- Name: UserFavorite_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserFavorite_userId_idx" ON public."UserFavorite" USING btree ("userId");


--
-- TOC entry 4313 (class 1259 OID 245736)
-- Name: UserFavorite_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserFavorite_userId_productId_key" ON public."UserFavorite" USING btree ("userId", "productId");


--
-- TOC entry 4133 (class 1259 OID 245660)
-- Name: UserProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserProfile_userId_key" ON public."UserProfile" USING btree ("userId");


--
-- TOC entry 4136 (class 1259 OID 245662)
-- Name: UserSession_refreshToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON public."UserSession" USING btree ("refreshToken");


--
-- TOC entry 4137 (class 1259 OID 245661)
-- Name: UserSession_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserSession_token_key" ON public."UserSession" USING btree (token);


--
-- TOC entry 4138 (class 1259 OID 245663)
-- Name: UserSession_userId_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserSession_userId_token_idx" ON public."UserSession" USING btree ("userId", token);


--
-- TOC entry 4124 (class 1259 OID 245655)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4125 (class 1259 OID 245659)
-- Name: User_email_phone_role_status_merchantId_referredById_adminP_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_email_phone_role_status_merchantId_referredById_adminP_idx" ON public."User" USING btree (email, phone, role, status, "merchantId", "referredById", "adminPermissions");


--
-- TOC entry 4126 (class 1259 OID 245656)
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- TOC entry 4129 (class 1259 OID 245658)
-- Name: User_referralCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_referralCode_key" ON public."User" USING btree ("referralCode");


--
-- TOC entry 4130 (class 1259 OID 245657)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 4263 (class 1259 OID 245718)
-- Name: WebhookEndpoint_merchantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WebhookEndpoint_merchantId_idx" ON public."WebhookEndpoint" USING btree ("merchantId");


--
-- TOC entry 4268 (class 1259 OID 245719)
-- Name: WebhookLog_webhookEndpointId_status_event_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WebhookLog_webhookEndpointId_status_event_idx" ON public."WebhookLog" USING btree ("webhookEndpointId", status, event);


--
-- TOC entry 4234 (class 1259 OID 245705)
-- Name: Withdrawal_userId_status_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Withdrawal_userId_status_createdAt_idx" ON public."Withdrawal" USING btree ("userId", status, "createdAt");


--
-- TOC entry 4434 (class 2606 OID 246110)
-- Name: Announcement Announcement_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4418 (class 2606 OID 246035)
-- Name: ApiKey ApiKey_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4419 (class 2606 OID 246030)
-- Name: ApiKey ApiKey_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApiKey"
    ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4451 (class 2606 OID 246200)
-- Name: AuditLog AuditLog_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4452 (class 2606 OID 246195)
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4397 (class 2606 OID 245935)
-- Name: BalanceTransaction BalanceTransaction_depositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BalanceTransaction"
    ADD CONSTRAINT "BalanceTransaction_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES public."Deposit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4398 (class 2606 OID 245930)
-- Name: BalanceTransaction BalanceTransaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BalanceTransaction"
    ADD CONSTRAINT "BalanceTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4399 (class 2606 OID 245925)
-- Name: BalanceTransaction BalanceTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BalanceTransaction"
    ADD CONSTRAINT "BalanceTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4400 (class 2606 OID 245940)
-- Name: BalanceTransaction BalanceTransaction_withdrawalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BalanceTransaction"
    ADD CONSTRAINT "BalanceTransaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES public."Withdrawal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4433 (class 2606 OID 246105)
-- Name: Banner Banner_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Banner"
    ADD CONSTRAINT "Banner_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4376 (class 2606 OID 245820)
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4454 (class 2606 OID 246276)
-- Name: ChatMessage ChatMessage_chatRoomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES public."ChatRoom"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4453 (class 2606 OID 246271)
-- Name: ChatRoom ChatRoom_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatRoom"
    ADD CONSTRAINT "ChatRoom_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4403 (class 2606 OID 245955)
-- Name: CommissionRule CommissionRule_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionRule"
    ADD CONSTRAINT "CommissionRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4404 (class 2606 OID 245960)
-- Name: CommissionRule CommissionRule_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionRule"
    ADD CONSTRAINT "CommissionRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4405 (class 2606 OID 245965)
-- Name: Commission Commission_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commission"
    ADD CONSTRAINT "Commission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4406 (class 2606 OID 245970)
-- Name: Commission Commission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commission"
    ADD CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4424 (class 2606 OID 246060)
-- Name: DailySalesSnapshot DailySalesSnapshot_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailySalesSnapshot"
    ADD CONSTRAINT "DailySalesSnapshot_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4394 (class 2606 OID 245920)
-- Name: Deposit Deposit_confirmedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4395 (class 2606 OID 245915)
-- Name: Deposit Deposit_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4396 (class 2606 OID 245910)
-- Name: Deposit Deposit_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4369 (class 2606 OID 245785)
-- Name: DeviceTrusted DeviceTrusted_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DeviceTrusted"
    ADD CONSTRAINT "DeviceTrusted_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4449 (class 2606 OID 246185)
-- Name: DisputeCase DisputeCase_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DisputeCase"
    ADD CONSTRAINT "DisputeCase_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4409 (class 2606 OID 245990)
-- Name: DownlineTree DownlineTree_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownlineTree"
    ADD CONSTRAINT "DownlineTree_childId_fkey" FOREIGN KEY ("childId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4410 (class 2606 OID 245985)
-- Name: DownlineTree DownlineTree_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DownlineTree"
    ADD CONSTRAINT "DownlineTree_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4431 (class 2606 OID 246095)
-- Name: EmailCampaignLog EmailCampaignLog_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailCampaignLog"
    ADD CONSTRAINT "EmailCampaignLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."EmailCampaign"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4432 (class 2606 OID 246100)
-- Name: EmailCampaignLog EmailCampaignLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailCampaignLog"
    ADD CONSTRAINT "EmailCampaignLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4436 (class 2606 OID 246120)
-- Name: EmailCampaign EmailCampaign_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailCampaign"
    ADD CONSTRAINT "EmailCampaign_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4366 (class 2606 OID 245775)
-- Name: FraudDetection FraudDetection_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FraudDetection"
    ADD CONSTRAINT "FraudDetection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4367 (class 2606 OID 245770)
-- Name: FraudDetection FraudDetection_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FraudDetection"
    ADD CONSTRAINT "FraudDetection_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4386 (class 2606 OID 245870)
-- Name: GameServer GameServer_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GameServer"
    ADD CONSTRAINT "GameServer_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4422 (class 2606 OID 246050)
-- Name: Invoice Invoice_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4368 (class 2606 OID 245780)
-- Name: LoginAttempt LoginAttempt_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LoginAttempt"
    ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4411 (class 2606 OID 245995)
-- Name: MLMCommission MLMCommission_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MLMCommission"
    ADD CONSTRAINT "MLMCommission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4412 (class 2606 OID 246000)
-- Name: MLMCommission MLMCommission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MLMCommission"
    ADD CONSTRAINT "MLMCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4446 (class 2606 OID 246175)
-- Name: MaintenanceSchedule MaintenanceSchedule_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceSchedule"
    ADD CONSTRAINT "MaintenanceSchedule_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4447 (class 2606 OID 246170)
-- Name: MaintenanceSchedule MaintenanceSchedule_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceSchedule"
    ADD CONSTRAINT "MaintenanceSchedule_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4371 (class 2606 OID 245795)
-- Name: MerchantMember MerchantMember_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantMember"
    ADD CONSTRAINT "MerchantMember_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4372 (class 2606 OID 245800)
-- Name: MerchantMember MerchantMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantMember"
    ADD CONSTRAINT "MerchantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4455 (class 2606 OID 246298)
-- Name: MerchantProductOverride MerchantProductOverride_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductOverride"
    ADD CONSTRAINT "MerchantProductOverride_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4456 (class 2606 OID 246303)
-- Name: MerchantProductOverride MerchantProductOverride_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductOverride"
    ADD CONSTRAINT "MerchantProductOverride_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4383 (class 2606 OID 245855)
-- Name: MerchantProductPrice MerchantProductPrice_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductPrice"
    ADD CONSTRAINT "MerchantProductPrice_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4384 (class 2606 OID 245860)
-- Name: MerchantProductPrice MerchantProductPrice_productSkuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductPrice"
    ADD CONSTRAINT "MerchantProductPrice_productSkuId_fkey" FOREIGN KEY ("productSkuId") REFERENCES public."ProductSku"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4385 (class 2606 OID 245865)
-- Name: MerchantProductPrice MerchantProductPrice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantProductPrice"
    ADD CONSTRAINT "MerchantProductPrice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4450 (class 2606 OID 246190)
-- Name: MerchantSetting MerchantSetting_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MerchantSetting"
    ADD CONSTRAINT "MerchantSetting_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4370 (class 2606 OID 245790)
-- Name: Merchant Merchant_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Merchant"
    ADD CONSTRAINT "Merchant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4428 (class 2606 OID 246085)
-- Name: Notification Notification_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4429 (class 2606 OID 246080)
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4391 (class 2606 OID 245895)
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4387 (class 2606 OID 245880)
-- Name: Order Order_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4388 (class 2606 OID 245885)
-- Name: Order Order_productSkuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_productSkuId_fkey" FOREIGN KEY ("productSkuId") REFERENCES public."ProductSku"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4389 (class 2606 OID 245890)
-- Name: Order Order_promoCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES public."PromoCode"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4390 (class 2606 OID 245875)
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4365 (class 2606 OID 245765)
-- Name: OtpVerification OtpVerification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OtpVerification"
    ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4393 (class 2606 OID 245905)
-- Name: PaymentChannel PaymentChannel_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PaymentChannel"
    ADD CONSTRAINT "PaymentChannel_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4392 (class 2606 OID 245900)
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4435 (class 2606 OID 246115)
-- Name: PopupPromo PopupPromo_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PopupPromo"
    ADD CONSTRAINT "PopupPromo_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4444 (class 2606 OID 246160)
-- Name: ProductReview ProductReview_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductReview"
    ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4445 (class 2606 OID 246165)
-- Name: ProductReview ProductReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductReview"
    ADD CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4425 (class 2606 OID 246070)
-- Name: ProductSalesStats ProductSalesStats_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSalesStats"
    ADD CONSTRAINT "ProductSalesStats_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4426 (class 2606 OID 246065)
-- Name: ProductSalesStats ProductSalesStats_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSalesStats"
    ADD CONSTRAINT "ProductSalesStats_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4378 (class 2606 OID 245830)
-- Name: ProductSku ProductSku_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSku"
    ADD CONSTRAINT "ProductSku_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4379 (class 2606 OID 245835)
-- Name: ProductSku ProductSku_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductSku"
    ADD CONSTRAINT "ProductSku_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4377 (class 2606 OID 245825)
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4413 (class 2606 OID 246015)
-- Name: PromoCode PromoCode_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4414 (class 2606 OID 246005)
-- Name: PromoCode PromoCode_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4415 (class 2606 OID 246010)
-- Name: PromoCode PromoCode_productSkuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoCode"
    ADD CONSTRAINT "PromoCode_productSkuId_fkey" FOREIGN KEY ("productSkuId") REFERENCES public."ProductSku"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4416 (class 2606 OID 246020)
-- Name: PromoUsage PromoUsage_promoCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoUsage"
    ADD CONSTRAINT "PromoUsage_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES public."PromoCode"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4417 (class 2606 OID 246025)
-- Name: PromoUsage PromoUsage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromoUsage"
    ADD CONSTRAINT "PromoUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4430 (class 2606 OID 246090)
-- Name: PushNotificationLog PushNotificationLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushNotificationLog"
    ADD CONSTRAINT "PushNotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4407 (class 2606 OID 245980)
-- Name: ReferralReward ReferralReward_referredId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralReward"
    ADD CONSTRAINT "ReferralReward_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4408 (class 2606 OID 245975)
-- Name: ReferralReward ReferralReward_referrerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReferralReward"
    ADD CONSTRAINT "ReferralReward_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4448 (class 2606 OID 246180)
-- Name: RefundPolicy RefundPolicy_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundPolicy"
    ADD CONSTRAINT "RefundPolicy_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4423 (class 2606 OID 246055)
-- Name: SubscriptionHistory SubscriptionHistory_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SubscriptionHistory"
    ADD CONSTRAINT "SubscriptionHistory_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4375 (class 2606 OID 245815)
-- Name: SupplierBalanceHistory SupplierBalanceHistory_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierBalanceHistory"
    ADD CONSTRAINT "SupplierBalanceHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4373 (class 2606 OID 245810)
-- Name: SupplierLog SupplierLog_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierLog"
    ADD CONSTRAINT "SupplierLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4374 (class 2606 OID 245805)
-- Name: SupplierLog SupplierLog_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupplierLog"
    ADD CONSTRAINT "SupplierLog_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4442 (class 2606 OID 246150)
-- Name: SupportTicketReply SupportTicketReply_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicketReply"
    ADD CONSTRAINT "SupportTicketReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public."SupportTicket"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4443 (class 2606 OID 246155)
-- Name: SupportTicketReply SupportTicketReply_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicketReply"
    ADD CONSTRAINT "SupportTicketReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4439 (class 2606 OID 246145)
-- Name: SupportTicket SupportTicket_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4440 (class 2606 OID 246140)
-- Name: SupportTicket SupportTicket_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4441 (class 2606 OID 246135)
-- Name: SupportTicket SupportTicket_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4381 (class 2606 OID 245845)
-- Name: TierPriceHistory TierPriceHistory_productSkuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TierPriceHistory"
    ADD CONSTRAINT "TierPriceHistory_productSkuId_fkey" FOREIGN KEY ("productSkuId") REFERENCES public."ProductSku"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4382 (class 2606 OID 245850)
-- Name: TierPriceHistory TierPriceHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TierPriceHistory"
    ADD CONSTRAINT "TierPriceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4380 (class 2606 OID 245840)
-- Name: TierPricingRule TierPricingRule_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TierPricingRule"
    ADD CONSTRAINT "TierPricingRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4427 (class 2606 OID 246075)
-- Name: UserActivityLog UserActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserActivityLog"
    ADD CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4437 (class 2606 OID 246130)
-- Name: UserFavorite UserFavorite_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavorite"
    ADD CONSTRAINT "UserFavorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4438 (class 2606 OID 246125)
-- Name: UserFavorite UserFavorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserFavorite"
    ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4363 (class 2606 OID 245755)
-- Name: UserProfile UserProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserProfile"
    ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4364 (class 2606 OID 245760)
-- Name: UserSession UserSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4362 (class 2606 OID 245750)
-- Name: User User_referredById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4420 (class 2606 OID 246040)
-- Name: WebhookEndpoint WebhookEndpoint_merchantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookEndpoint"
    ADD CONSTRAINT "WebhookEndpoint_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES public."Merchant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4421 (class 2606 OID 246045)
-- Name: WebhookLog WebhookLog_webhookEndpointId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_webhookEndpointId_fkey" FOREIGN KEY ("webhookEndpointId") REFERENCES public."WebhookEndpoint"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4401 (class 2606 OID 245950)
-- Name: Withdrawal Withdrawal_processedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4402 (class 2606 OID 245945)
-- Name: Withdrawal Withdrawal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-03-12 15:38:22 WIB

--
-- PostgreSQL database dump complete
--

\unrestrict NrA9hSKz3yKpyPHK2U6n8uRi1EVg6WzLV4Gx78gwrjqJO1LpESxlOJhsF7kwqnT

