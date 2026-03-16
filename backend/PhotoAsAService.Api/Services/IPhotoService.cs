using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Services;

public interface IPhotoService
{
	Task<IReadOnlyList<Photo>> GetAllAsync(string sortBy, bool descending);
	Task<Photo?> GetByIdAsync(int id);
	Task<Photo> CreateAsync(string name, IFormFile? file);
	Task<bool> DeleteAsync(int id);
}
