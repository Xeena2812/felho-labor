using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.EntityFrameworkCore;
using PhotoAsAService.Api.Data;
using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Services;

public class PhotoService(
	ApplicationDbContext dbContext,
	IConfiguration configuration) : IPhotoService
{
	private const string DefaultImageUrl = "/photo.jpg";
	private readonly string _blobConnectionString = configuration["BlobStorage:ConnectionString"]
		?? throw new InvalidOperationException("BlobStorage:ConnectionString is required.");
	private readonly string _blobContainerName = configuration["BlobStorage:ContainerName"]
		?? throw new InvalidOperationException("BlobStorage:ContainerName is required.");

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
		await DeleteStoredFileIfExistsAsync(photo.ImageUrl);
		return true;
	}

	private async Task<string> SaveUploadedFileAsync(IFormFile? file)
	{
		if (file is null || file.Length == 0)
		{
			return DefaultImageUrl;
		}

		return await SaveUploadedFileToBlobAsync(file);
	}

	private async Task<string> SaveUploadedFileToBlobAsync(IFormFile file)
	{
		var containerClient = new BlobContainerClient(_blobConnectionString, _blobContainerName);
		await containerClient.CreateIfNotExistsAsync();

		var extension = Path.GetExtension(file.FileName);
		var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".jpg" : extension;
		var blobName = $"{Guid.NewGuid():N}{safeExtension}";
		var blobClient = containerClient.GetBlobClient(blobName);

		await using var stream = file.OpenReadStream();
		var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "image/jpeg" : file.ContentType;
		await blobClient.UploadAsync(stream, new BlobUploadOptions
		{
			HttpHeaders = new BlobHttpHeaders
			{
				ContentType = contentType
			}
		});

		return blobClient.Uri.ToString();
	}

	private async Task DeleteStoredFileIfExistsAsync(string imageUrl)
	{
		if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var blobUri))
		{
			return;
		}

		var blobName = GetBlobName(blobUri);
		if (!string.IsNullOrWhiteSpace(blobName))
		{
			var containerClient = new BlobContainerClient(_blobConnectionString, _blobContainerName);
			await containerClient.DeleteBlobIfExistsAsync(blobName);
		}
	}

	private static string? GetBlobName(Uri blobUri)
	{
		if (blobUri.Segments.Length == 0)
		{
			return null;
		}

		return Uri.UnescapeDataString(blobUri.Segments[^1].Trim('/'));
	}
}
