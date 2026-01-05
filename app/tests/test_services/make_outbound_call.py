import asyncio
from app.services.outbound_service import make_outbound_call

async def t():
    r = await make_outbound_call("+91 8928795173")
    print(r)

asyncio.run(t())
