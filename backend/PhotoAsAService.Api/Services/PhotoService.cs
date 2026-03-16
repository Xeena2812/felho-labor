using Microsoft.EntityFrameworkCore;
using PhotoAsAService.Api.Data;
using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Services;

public class PhotoService(ApplicationDbContext dbContext, IWebHostEnvironment environment) : IPhotoService
{
	private const string DefaultImageUrl = "/photo.jpg";

	public async Task<IReadOnlyList<Photo>> GetAllAsync(string sortBy, bool descending)
	{
		IQueryable<Photo> query = dbContext.Photos.AsNoTracking();

		query = sortBy.ToLowerInvariant() switch
		{
			"name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
			_ => descending ? query.OrderByDescending(p => p.UploadedAt) : query.OrderBy(p => p.UploadedAt)
		};

		return await query.ToListAsync();
	}

	public async Task<Photo?> GetByIdAsync(int id)
	{
		return await dbContext.Photos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
	}

	public async Task<Photo> CreateAsync(string name, IFormFile? file)
	{
		var imageUrl = await SaveUploadedFileAsync(file);
		var photo = new Photo
		{
			Name = name,
			UploadedAt = DateTime.UtcNow,
			ImageUrl = imageUrl
		};

		dbContext.Photos.Add(photo);
		await dbContext.SaveChangesAsync();
		return photo;
	}

	public async Task<bool> DeleteAsync(int id)
	{
		var photo = await dbContext.Photos.FirstOrDefaultAsync(p => p.Id == id);
		if (photo is null)
		{
			return false;
		}

		dbContext.Photos.Remove(photo);
		await dbContext.SaveChangesAsync();
		DeleteStoredFileIfExists(photo.ImageUrl);
		return true;
	}

	private async Task<string> SaveUploadedFileAsync(IFormFile? file)
	{
		if (file is null || file.Length == 0)
		{
			return DefaultImageUrl;
		}

		var uploadsDirectory = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads");
		Directory.CreateDirectory(uploadsDirectory);

		var extension = Path.GetExtension(file.FileName);
		var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".jpg" : extension;
		var fileName = $"{Guid.NewGuid():N}{safeExtension}";
		var filePath = Path.Combine(uploadsDirectory, fileName);

		await using var stream = File.Create(filePath);
		await file.CopyToAsync(stream);

		return $"/uploads/{fileName}";
	}

	private void DeleteStoredFileIfExists(string imageUrl)
	{
		if (!imageUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
		{
			return;
		}

		var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
		var absolutePath = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), relativePath);
		if (File.Exists(absolutePath))
		{
			File.Delete(absolutePath);
		}
	}
}
