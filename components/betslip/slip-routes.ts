const OWN_TICKET_ROUTES = ['/hippique', '/lotteries', '/jackpot']

export function hasOwnTicket(pathname: string) {
  return OWN_TICKET_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}
