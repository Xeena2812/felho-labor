import random
from typing import Any

from locust import HttpUser, between, task


def extract_photo_ids(payload: Any) -> list[int]:
    ids: list[int] = []
    for item in payload:
        if isinstance(item, dict) and isinstance(item.get("id"), int):
            ids.append(item["id"])
    return ids


class AnonymousUser(HttpUser):
    wait_time = between(0.2, 1.5)

    @task
    def browse_photos(self) -> None:
        with self.client.get(
            "/api/photos?sortBy=date&descending=true", # Sorting doesnt really matter here.
            name="GET /api/photos",
            catch_response=True,
        ) as list_response:
            if list_response.status_code != 200:
                list_response.failure(f"Unexpected status: {list_response.status_code}")
                return

            try:
                photo_ids = extract_photo_ids(list_response.json())
            except Exception as exc:
                list_response.failure(f"Invalid JSON: {exc}")
                return

        if not photo_ids:
            return

        for photo_id in random.sample(photo_ids, k=min(5, len(photo_ids))):
            with self.client.get(
                f"/api/photos/{photo_id}",
                name="GET /api/photos/{id}",
                catch_response=True,
            ) as detail_response:
                if detail_response.status_code != 200:
                    detail_response.failure(f"Unexpected status: {detail_response.status_code}")
