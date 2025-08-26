import openpyxl
from openpyxl import Workbook
from datetime import datetime

wb = Workbook()
ws = wb.active
ws.title = "Users"

# Header
ws.append([
    "pk", "id", "name", "email", "password", "created_at", "onboarding_complete", "onboarding_data"
])

# Dummy data
rows = [
    [1, "1", "John Doe", "john@example.com", "Password123", "2023-01-01T10:00:00Z", True, '{"step1":true,"step2":true}'],
    [2, "2", "Jane Smith", "jane@example.com", "Password456", "2023-02-15T12:30:00Z", False, '{"step1":true,"step2":false}'],
    [3, "3", "Test User", "testuser@example.com", "TestPass789", "2023-03-10T09:15:00Z", True, '{"step1":true,"step2":true}'],
    [4, "4", "Demo User", "demo@example.com", "DemoPass321", "2023-04-20T14:45:00Z", False, '{"step1":false,"step2":false}'],
]

for row in rows:
    ws.append(row)

wb.save("dummy_users.xlsx")
print("dummy_users.xlsx created.")
