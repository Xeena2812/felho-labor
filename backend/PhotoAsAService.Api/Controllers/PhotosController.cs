using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhotoAsAService.Api.DTOs;
using PhotoAsAService.Api.Services;

namespace PhotoAsAService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController(IPhotoService photoService) : ControllerBase
{
	[HttpGet]
	public async Task<ActionResult> GetAll([FromQuery] string sortBy = "date", [FromQuery] bool descending = true)
	{
		var photos = await photoService.GetAllAsync(sortBy, descending);
		return Ok(photos);
	}

	[HttpGet("{id:int}")]
	public async Task<ActionResult> GetById(int id)
	{
		var photo = await photoService.GetByIdAsync(id);
		if (photo is null)
		{
			return NotFound();
		}

		return Ok(photo);
	}

	[Authorize]
	[HttpPost]
	public async Task<ActionResult> Create([FromForm] CreatePhotoDto request)
	{
		var validationError = ValidateName(request.Name);
		if (validationError is not null)
		{
			return BadRequest(validationError);
		}

		var created = await photoService.CreateAsync(request.Name.Trim(), request.File);
		return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
	}

	[Authorize]
	[HttpDelete("{id:int}")]
	public async Task<ActionResult> Delete(int id)
	{
		var deleted = await photoService.DeleteAsync(id);
		return deleted ? NoContent() : NotFound();
	}

	private static string? ValidateName(string? name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			return "Name is required.";
		}

		if (name.Trim().Length > 40)
		{
			return "Name must be at most 40 characters.";
		}

		return null;
	}
}
