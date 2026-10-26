from fastapi import APIRouter, Query
from sqlmodel import col, func, select

from app.api.deps import SessionDep
from app.models import Service, ServicePublic, ServicesPublic

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=ServicesPublic, summary="Lấy dịch vụ sửa chữa công khai")
def read_public_services(
    session: SessionDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> ServicesPublic:
    """Trả các dịch vụ đang hoạt động để khách hàng chọn khi đặt lịch."""
    statement = select(Service).where(Service.is_active).order_by(col(Service.name))
    count_statement = (
        select(func.count()).select_from(Service).where(Service.is_active)
    )
    services = session.exec(statement.offset(skip).limit(limit)).all()
    return ServicesPublic(
        data=[ServicePublic.model_validate(service) for service in services],
        count=session.exec(count_statement).one(),
    )
