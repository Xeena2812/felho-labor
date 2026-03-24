using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PhotoAsAService.Api.DTOs;

namespace PhotoAsAService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
	UserManager<IdentityUser> userManager,
	SignInManager<IdentityUser> signInManager) : ControllerBase
{
	[HttpPost("register")]
	public async Task<ActionResult> Register([FromBody] RegisterDto request)
	{
		if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
		{
			return BadRequest("Email and password are required.");
		}

		var user = new IdentityUser
		{
			UserName = request.Email.Trim(),
			Email = request.Email.Trim()
		};

		var result = await userManager.CreateAsync(user, request.Password);
		if (!result.Succeeded)
		{
			return BadRequest(result.Errors.Select(e => e.Description));
		}

		return Ok();
	}

	[HttpPost("login")]
	public async Task<ActionResult> Login([FromBody] LoginDto request)
	{
		if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
		{
			return BadRequest("Email and password are required.");
		}

		var result = await signInManager.PasswordSignInAsync(
			request.Email.Trim(),
			request.Password,
			isPersistent: false,
			lockoutOnFailure: false);

		if (!result.Succeeded)
		{
			return Unauthorized("Invalid email or password.");
		}

		return Ok();
	}

	[Authorize]
	[HttpPost("logout")]
	public async Task<ActionResult> Logout()
	{
		await signInManager.SignOutAsync();
		return Ok();
	}

	[Authorize]
	[HttpDelete("delete")]
	public async Task<ActionResult> DeleteCurrentUser()
	{
		var user = await userManager.GetUserAsync(User);
		if (user is null)
		{
			return Unauthorized();
		}

		var result = await userManager.DeleteAsync(user);
		if (!result.Succeeded)
		{
			return BadRequest(result.Errors.Select(e => e.Description));
		}

		await signInManager.SignOutAsync();
		return NoContent();
	}
}
