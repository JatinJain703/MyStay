"""Central price-breakdown logic, shared by quotes and booking creation."""
from datetime import date

from app.models.booking import PriceQuote

CLEANING_FEE = 35.0
SERVICE_FEE_RATE = 0.12


def nights_between(check_in: date, check_out: date) -> int:
    return (check_out - check_in).days


def compute_quote(nightly_rate: float, check_in: date, check_out: date) -> PriceQuote:
    nights = nights_between(check_in, check_out)
    subtotal = round(nightly_rate * nights, 2)
    cleaning_fee = CLEANING_FEE
    service_fee = round(subtotal * SERVICE_FEE_RATE, 2)
    total = round(subtotal + cleaning_fee + service_fee, 2)
    return PriceQuote(
        nightly_rate=nightly_rate,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total=total,
    )
