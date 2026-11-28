/**
 * Every use case from the V2 → V4 migration audit (doc 07), mapped to the V4 screen and
 * UI state that covers it. `platform` cases have no screen of their own (build, deploy,
 * tracking) and point to where their effect is visible, if anywhere.
 */
export type Coverage = 'new' | 'existing' | 'platform'

export interface UseCase {
  id: string
  title: string
  href: string | null
  coverage: Coverage
  note?: string
}

export interface UseCaseModule {
  id: string
  name: string
  cases: UseCase[]
}

type Row = [id: string, title: string, href: string | null, coverage: Coverage, note?: string]

const mod = (id: string, name: string, rows: Row[]): UseCaseModule => ({
  id,
  name,
  cases: rows.map(([caseId, title, href, coverage, note]) => ({ id: caseId, title, href, coverage, note })),
})

export const USE_CASE_MODULES: UseCaseModule[] = [
  mod('CORE', 'Core platform', [
    ['UC-CORE-001', 'Cold start (anonymous, desktop)', '/', 'existing'],
    ['UC-CORE-002', 'Returning logged-in user', '/system-states?state=welcome-back', 'new'],
    ['UC-CORE-003', 'External deep link with session', '/sso?state=restoring', 'new'],
    ['UC-CORE-004', 'Account activation link', '/activate?state=link-success', 'new'],
    ['UC-CORE-005', 'Maintenance on', '/maintenance', 'new'],
    ['UC-CORE-006', 'Protected route while logged out', '/system-states?state=protected-route', 'new'],
    ['UC-CORE-007', 'Session expiry', '/system-states?state=session-expired', 'new'],
    ['UC-CORE-008', 'Language switch', '/', 'existing', 'FR / EN toggle in the header'],
    ['UC-CORE-009', 'Native app webview entry', '/system-states?state=webview', 'new'],
    ['UC-CORE-010', 'Age gate rejection', '/system-states?state=age-rejected', 'new'],
    ['UC-CORE-011', 'Mobile-upgrade redirect', '/system-states?state=mobile-upgrade', 'new'],
    ['UC-CORE-012', 'Footer page deep link', '/rules', 'new'],
  ]),
  mod('TEN', 'Tenancy, build and deploy', [
    ['UC-TEN-001', 'Visitor opens a brand site', '/', 'existing', 'Theme, title and products come from tenant config'],
    ['UC-TEN-002', 'Customer uses a self-service kiosk', '/betslip/states?state=kiosk', 'new'],
    ['UC-TEN-003', 'Returning user gets a new release', '/system-states?state=new-release', 'new'],
    ['UC-TEN-004', 'Release engineer builds a brand', null, 'platform', 'Build pipeline, no UI'],
    ['UC-TEN-005', 'Ops deploys the container', null, 'platform', 'Deployment, no UI'],
    ['UC-TEN-006', 'Mobile user on an upgrade-enabled brand', '/system-states?state=mobile-upgrade', 'new'],
  ]),
  mod('RT', 'Realtime and sport data', [
    ['UC-RT-001', 'Live odds change for a visible event', '/sports', 'existing', 'Odds flash with up/down arrow'],
    ['UC-RT-002', 'Bet stop for markets', '/event/live?state=bet-stop', 'new'],
    ['UC-RT-003', 'Odds of a selected outcome change', '/betslip/states?state=odds-change', 'new'],
    ['UC-RT-004', 'Live match ends', '/event/live?state=ended', 'new'],
    ['UC-RT-005', 'Network drop', '/system-states?state=network-drop', 'new'],
    ['UC-RT-006', 'Disable live/prematch betting', '/system-states?state=live-disabled', 'new'],
    ['UC-RT-007', 'Session opened elsewhere', '/system-states?state=session-elsewhere', 'new'],
    ['UC-RT-008', 'Prematch event kicks off (HandedOver)', '/event/prematch?state=kickoff', 'new'],
    ['UC-RT-009', 'Browse sport → category → tournament → events', '/sports', 'existing'],
    ['UC-RT-010', 'Open event markets', '/event/prematch', 'new'],
    ['UC-RT-011', 'Broadcast notification', '/system-states?state=broadcast', 'new'],
    ['UC-RT-012', 'Home stats push', '/', 'existing', 'Live counts on the home tiles'],
    ['UC-RT-013', 'Feed silent > 60 s for live event', '/event/live?state=feed-silent', 'new'],
  ]),
  mod('SPT', 'Sportsbook UI', [
    ['UC-SPT-001', 'Browse home and add a selection', '/', 'existing'],
    ['UC-SPT-002', 'Change sport tab on a rail', '/sports', 'existing', 'Empty sport shows an info message'],
    ['UC-SPT-003', 'Filter last-minute window', '/last-minute', 'new'],
    ['UC-SPT-004', 'Open event detail and bet on a secondary market', '/event/prematch', 'new'],
    ['UC-SPT-005', 'Search an event', '/search?q=united', 'new'],
    ['UC-SPT-006', 'Select a tournament in the sidebar (desktop prematch)', '/sports', 'existing'],
    ['UC-SPT-007', 'Follow a live match with the tracker', '/event/live', 'new'],
    ['UC-SPT-008', 'Favourite a match', '/favourites', 'new'],
    ['UC-SPT-009', 'View results', '/results', 'new'],
    ['UC-SPT-010', 'Browse a flagship tournament', '/tournament/flagship', 'new'],
    ['UC-SPT-011', 'Suspended odds', '/event/live?state=bet-stop', 'new'],
    ['UC-SPT-012', 'Odds movement indicator', '/sports', 'existing'],
  ]),
  mod('BSL', 'Betslip and tickets', [
    ['UC-BSL-001', 'Build a slip', '/', 'existing'],
    ['UC-BSL-002', 'Place a multiple', '/betslip/states?state=multiple', 'new'],
    ['UC-BSL-003', 'Place singles', '/betslip/states?state=singles', 'new'],
    ['UC-BSL-004', 'System bet', '/betslip/states?state=system', 'new'],
    ['UC-BSL-005', 'Insufficient balance', '/betslip/states?state=insufficient', 'new'],
    ['UC-BSL-006', 'Suspended or finished selection', '/betslip/states?state=suspended', 'new'],
    ['UC-BSL-007', 'Odds change', '/betslip/states?state=odds-change', 'new'],
    ['UC-BSL-008', 'Logged out', '/betslip/states?state=logged-out', 'new'],
    ['UC-BSL-009', 'Generate and share a booking code', '/betslip/states?state=booking-code', 'new'],
    ['UC-BSL-010', 'Load a booking code', '/betslip/states?state=load-code', 'new'],
    ['UC-BSL-011', 'Reload the page', '/betslip/states?state=restored', 'new'],
    ['UC-BSL-012', 'Use a sport bonus', '/betslip/states?state=sport-bonus', 'new'],
    ['UC-BSL-013', 'Verify a ticket', '/ticket', 'existing'],
    ['UC-BSL-014', 'Browse My bets', '/my-bets', 'existing'],
    ['UC-BSL-015', 'Cash out', '/betslip/states?state=cash-out', 'new'],
    ['UC-BSL-016', 'Repeat an open bet', '/betslip/states?state=repeat', 'new'],
    ['UC-BSL-017', 'Goal jackpot bet', '/betslip/states?state=goal-jackpot', 'new'],
    ['UC-BSL-018', 'Kiosk booking', '/betslip/states?state=kiosk', 'new'],
    ['UC-BSL-019', 'Event restriction', '/betslip/states?state=restriction', 'new'],
  ]),
  mod('ACC', 'Account and auth', [
    ['UC-ACC-001', 'Login with phone and password', '/sign-in', 'existing'],
    ['UC-ACC-002', 'Self-excluded user tries to log in', '/system-states?state=self-excluded', 'new'],
    ['UC-ACC-003', 'Quick signup with OTP', '/signup/quick', 'new'],
    ['UC-ACC-004', 'Full signup', '/signup/full', 'new'],
    ['UC-ACC-005', 'Activate an existing account', '/activate', 'new'],
    ['UC-ACC-006', 'Forgot password', '/forgot-password', 'new'],
    ['UC-ACC-007', 'Change password', '/account/password', 'new'],
    ['UC-ACC-008', 'Edit profile', '/account/profile', 'new'],
    ['UC-ACC-009', 'Set gambling limits', '/account/responsible-gaming', 'new'],
    ['UC-ACC-010', 'Self-exclude', '/account/responsible-gaming?state=self-exclude', 'new'],
    ['UC-ACC-011', 'Self-recover an exclusion', '/account/responsible-gaming?state=recover', 'new'],
    ['UC-ACC-012', 'Session expiry and logout', '/system-states?state=session-expired', 'new'],
    ['UC-ACC-013', 'Age notice', '/system-states?state=age-gate', 'new'],
    ['UC-ACC-014', 'Session restore and SSO via URL', '/sso', 'new'],
  ]),
  mod('PAY', 'Wallet and payments', [
    ['UC-PAY-001', 'Deposit by mobile money (non-Paytus)', '/wallet/deposit', 'new'],
    ['UC-PAY-002', 'Deposit via Paytus with operator OTP', '/wallet/deposit?state=paytus-otp', 'new'],
    ['UC-PAY-003', 'Deposit via payment code', '/wallet/deposit?state=payment-code', 'new'],
    ['UC-PAY-004', 'Deposit via redirect / KoraPay iframe', '/wallet/deposit?state=redirect', 'new'],
    ['UC-PAY-005', 'Deposit by voucher', '/wallet/deposit?state=voucher', 'new'],
    ['UC-PAY-006', 'Withdraw to mobile money with OTP', '/wallet/withdraw?state=momo-otp', 'new'],
    ['UC-PAY-007', 'Withdraw by bank transfer', '/wallet/withdraw?state=bank', 'new'],
    ['UC-PAY-008', 'Withdrawal blocked', '/wallet/withdraw?state=blocked-profile', 'new'],
    ['UC-PAY-009', 'Deposit with currency conversion', '/wallet/deposit?state=conversion', 'new'],
    ['UC-PAY-010', 'Add payment account', '/wallet/accounts?state=add', 'new'],
    ['UC-PAY-011', 'View transaction history', '/wallet/history', 'new'],
    ['UC-PAY-012', 'View wallet statement', '/wallet/history?state=statement', 'new'],
    ['UC-PAY-013', 'Balance refresh by socket', '/wallet/history?state=balance-push', 'new'],
  ]),
  mod('BON', 'Bonuses and promotions', [
    ['UC-BON-001', 'Claim a free spin from the SMS link', '/offer/FS2026', 'new'],
    ['UC-BON-002', 'Wrong or expired code', '/offer/FS2026?state=code-invalid', 'new'],
    ['UC-BON-003', 'Link opened while logged in as another customer', '/offer/FS2026?state=other-customer', 'new'],
    ['UC-BON-004', 'Offer not available / no offer', '/offer/FS2026?state=not-available', 'new'],
    ['UC-BON-005', 'Email already used', '/offer/FS2026?state=email-used', 'new'],
    ['UC-BON-006', 'Multiple bet with accumulator bonus', '/betslip/states?state=multiple', 'new'],
    ['UC-BON-007', 'Use a wallet bonus on a bet', '/betslip/states?state=sport-bonus', 'new'],
    ['UC-BON-008', 'View bonus conditions and movements', '/account/bonuses', 'new'],
    ['UC-BON-009', 'Bonus history by date range', '/account/bonuses?state=history', 'new'],
    ['UC-BON-010', 'Jackpot countdown and play', '/jackpot', 'existing'],
    ['UC-BON-011', 'Login alerts (welcome-back / bonus message / jackpot)', '/system-states?state=login-bonus', 'new'],
    ['UC-BON-012', 'Refer & earn', '/refer', 'new'],
  ]),
  mod('GAM', 'Games and products', [
    ['UC-GAM-001', 'Launch a crash game with real money', '/games/crash?state=real', 'new'],
    ['UC-GAM-002', 'Crash game demo (logged out)', '/games/crash?state=demo', 'new'],
    ['UC-GAM-003', 'Aviator real play', '/games/aviator?state=real', 'new'],
    ['UC-GAM-004', 'Aviator demo', '/games/aviator?state=demo', 'new'],
    ['UC-GAM-005', 'Browse Euro Virtual', '/games/euro-virtual', 'new'],
    ['UC-GAM-006', 'Euro Virtual launch, real, with login redirect', '/games/euro-virtual?state=login-required', 'new'],
    ['UC-GAM-007', 'Euro Virtual launch failure', '/games/euro-virtual?state=launch-failed', 'new'],
    ['UC-GAM-008', 'Play virtual sports', '/virtuals', 'existing'],
    ['UC-GAM-009', 'Lottery session expiry', '/system-states?state=lottery-expired', 'new'],
    ['UC-GAM-010', 'Launch from featured games', '/games/crash', 'new', 'Featured strip at the top of the lobby'],
    ['UC-GAM-011', 'Offer game launch (trigger owned by BON)', '/offer/FS2026?state=claimed', 'new'],
    ['UC-GAM-012', 'Product hidden for a tenant', '/', 'existing', 'NEXT_PUBLIC_PRODUCTS hides nav items and routes'],
  ]),
  mod('ENG', 'Engagement and content', [
    ['UC-ENG-001', 'Attributed landing', null, 'platform', 'Attribution params captured on entry, no UI'],
    ['UC-ENG-002', 'Tracked click', null, 'platform', 'Analytics event, no UI'],
    ['UC-ENG-003', 'Broadcast notification', '/system-states?state=broadcast', 'new'],
    ['UC-ENG-004', 'Recommended events', '/event/prematch', 'new', 'Recommended rail under the markets'],
    ['UC-ENG-005', 'App download prompt', '/system-states?state=app-download', 'new'],
    ['UC-ENG-006', 'Rules page and contact', '/rules', 'new'],
    ['UC-ENG-007', 'Language switch', '/', 'existing'],
    ['UC-ENG-008', 'Banner click', '/promotions', 'existing'],
    ['UC-ENG-009', 'Share referral', '/refer?state=share', 'new'],
    ['UC-ENG-010', 'How-to CTA', '/how-to', 'new'],
  ]),
]

export const ALL_USE_CASES = USE_CASE_MODULES.flatMap((m) => m.cases)
