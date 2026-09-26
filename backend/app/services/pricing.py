"""Price breakdown logic shared between quote previews and booking creation."""
from datetime import date

from app.models.booking import PriceQuote

FLAT_CLEANING_FEE = 35.0
SERVICE_RATE = 0.12


def count_nights(check_in: date, check_out: date) -> int:
    return (check_out - check_in).days


def build_quote(nightly_rate: float, check_in: date, check_out: date) -> PriceQuote:
    nights = count_nights(check_in, check_out)
    subtotal = round(nightly_rate * nights, 2)
    cleaning_fee = FLAT_CLEANING_FEE
    service_fee = round(subtotal * SERVICE_RATE, 2)
    total = round(subtotal + cleaning_fee + service_fee, 2)
    return PriceQuote(
        nightly_rate=nightly_rate,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total=total,
    )
