using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Services;

public class PhotoService : IPhotoService
{
	private readonly object _lock = new();
	private readonly List<Photo> _photos =
	[
		new() { Id = 1, Name = "Photo 1", UploadedAt = DateTime.UtcNow.AddDays(-5), ImageUrl = "/photo.jpg" },
		new() { Id = 2, Name = "Photo 2", UploadedAt = DateTime.UtcNow.AddDays(-3), ImageUrl = "/photo.jpg" },
		new() { Id = 3, Name = "Photo 3", UploadedAt = DateTime.UtcNow.AddDays(-1), ImageUrl = "/photo.jpg" }
	];

	private int _nextId = 4;

	public IReadOnlyList<Photo> GetAll(string sortBy, bool descending)
	{
		IEnumerable<Photo> query = _photos;

		query = sortBy.ToLowerInvariant() switch
		{
			"name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
			_ => descending ? query.OrderByDescending(p => p.UploadedAt) : query.OrderBy(p => p.UploadedAt)
		};

		return [.. query];
	}

	public Photo? GetById(int id)
	{
		lock (_lock)
		{
			return _photos.FirstOrDefault(p => p.Id == id);
		}
	}

	public Photo Create(string name, string? imageUrl)
	{
		lock (_lock)
		{
			var photo = new Photo
			{
				Id = _nextId++,
				Name = name,
				UploadedAt = DateTime.UtcNow,
				ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? "/photo.jpg" : imageUrl
			};

			_photos.Add(photo);
			return photo;
		}
	}

	public bool Delete(int id)
	{
		lock (_lock)
		{
			var photo = _photos.FirstOrDefault(p => p.Id == id);
			if (photo is null)
			{
				return false;
			}

			_photos.Remove(photo);
			return true;
		}
	}
}
