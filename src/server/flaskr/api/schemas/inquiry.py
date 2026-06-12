from pydantic import BaseModel

class InquirySchema(BaseModel):
    sender_name: str
    sender_email: str
    message: str
    interest_type: str
    consent_given: bool = False
