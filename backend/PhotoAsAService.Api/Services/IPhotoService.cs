using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Services;

public interface IPhotoService
{
	IReadOnlyList<Photo> GetAll(string sortBy, bool descending);
	Photo? GetById(int id);
	Photo Create(string name, string? imageUrl);
	bool Delete(int id);
}
