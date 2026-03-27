import random
import uuid
from typing import Any

from locust import HttpUser, between, task
from locust.exception import StopUser
import requests


def extract_photo_ids(payload: Any) -> list[int]:
    ids: list[int] = []
    for item in payload:
        if isinstance(item, dict) and isinstance(item.get("id"), int):
            ids.append(item["id"])
    return ids


class AnonymousUser(HttpUser):
    wait_time = between(0.2, 1.5)
    weight = 3

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


class AuthenticatedUser(HttpUser):
    wait_time = between(0.2, 1.0)
    weight = 7

    def on_start(self) -> None:
        self.known_photo_ids: list[int] = []
        self.created_photo_ids: list[int] = []

    def register_account(self) -> None:
        payload = {"email": self.email, "password": self.password}
        with self.client.post(
            "/api/auth/register",
            json=payload,
            name="POST /api/auth/register",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")

    def login(self) -> None:
        payload = {"email": self.email, "password": self.password}
        with self.client.post(
            "/api/auth/login",
            json=payload,
            name="POST /api/auth/login",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")

    def logout(self) -> None:
        with self.client.post(
            "/api/auth/logout",
            name="POST /api/auth/logout",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")

    def delete_account(self) -> None:
        with self.client.delete(
            "/api/auth/delete",
            name="DELETE /api/auth/delete",
            catch_response=True,
        ) as response:
            if response.status_code != 204:
                response.failure(f"Unexpected status: {response.status_code}")
                return

    def query_images(self) -> None:
        with self.client.get(
            "/api/photos?sortBy=date&descending=true",
            name="GET /api/photos (auth)",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")
                return

            try:
                self.known_photo_ids = extract_photo_ids(response.json())
            except Exception as exc:
                response.failure(f"Invalid JSON: {exc}")

    def upload_random_image(self) -> None:
        image_url = f"https://cataas.com/cat?width=1280&height=720&t={uuid.uuid4().hex}"

        try:
            image_response = requests.get(image_url, timeout=10)
            image_response.raise_for_status()
        except Exception:
            return

        content_type = image_response.headers.get("Content-Type", "image/jpeg")
        if "png" in content_type:
            extension = ".png"
        elif "webp" in content_type:
            extension = ".webp"
        elif "gif" in content_type:
            extension = ".gif"
        else:
            extension = ".jpg"

        id = uuid.uuid4()
        file_name = f"cat_{id}{extension}"
        files = {"file": (file_name, image_response.content, content_type)}
        data = {"name": f"Cat {id}"}

        with self.client.post(
            "/api/photos",
            data=data,
            files=files,
            name="POST /api/photos",
            catch_response=True,
        ) as response:
            if response.status_code != 201:
                response.failure(f"Unexpected status: {response.status_code}")
                return

            try:
                payload = response.json()
            except Exception as exc:
                response.failure(f"Invalid JSON: {exc}")
                return

            if isinstance(payload, dict) and isinstance(payload.get("id"), int):
                self.known_photo_ids.append(payload["id"])
                self.created_photo_ids.append(payload["id"])

    def view_random_image(self) -> None:
        if not self.known_photo_ids:
            self.query_images()

        if not self.known_photo_ids:
            return

        photo_id = random.choice(self.known_photo_ids)
        with self.client.get(
            f"/api/photos/{photo_id}",
            name="GET /api/photos/{id} (auth)",
            catch_response=True,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Unexpected status: {response.status_code}")

    def delete_created_images(self) -> None:
        delete_count = max(0, len(self.created_photo_ids))
        for _ in range(delete_count):
            photo_id = self.created_photo_ids.pop(0)
            with self.client.delete(
                f"/api/photos/{photo_id}",
                name="DELETE /api/photos/{id} (auth)",
                catch_response=True,
            ) as response:
                if response.status_code not in (204, 404):
                    response.failure(f"Unexpected status: {response.status_code}")

    @task
    def run_authenticated_session(self) -> None:
        self.password = "Test123!"
        self.email = f"locust_{uuid.uuid4()}@example.com"
        self.register_account()
        self.login()

        create_count = random.randint(3, 5)
        query_count = random.randint(5, 10)
        view_count = random.randint(5, 10)

        for _ in range(create_count):
            self.upload_random_image()

        for _ in range(query_count):
            self.query_images()

        for _ in range(view_count):
            self.view_random_image()

        self.delete_created_images()

        self.delete_account()
