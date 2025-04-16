using AutoMapper;
using Database.Data;
using DataBase.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;
using WebHotel.DTO;
using WebHotel.DTO.BlogDtos;
using WebHotel.Service.FileService;

namespace WebHotel.Controllers.AdminController;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("v{version:apiVersion}/admin/blog/")]
[ApiVersion("2.0")]
public class BlogAdminController : ControllerBase
{
    private readonly MyDBContext _context;
    private readonly IMapper _mapper;
    private readonly FileService _fileService;

    public BlogAdminController(MyDBContext context, IMapper mapper, FileService fileService)
    {
        _context = context;
        _mapper = mapper;
        _fileService = fileService;
    }

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> Create(BlogCreateDto blogCreateDto)
    {
        var email = User.FindFirst(ClaimTypes.Email)!.Value;
        var user = _context.ApplicationUsers.SingleOrDefaultAsync(a => a.Email == email);
        if (user.Result == null)
        {
            return BadRequest(new StatusDto { StatusCode = 0, Message = "Email Poster is not valid" });
        }

        var blogNew = _mapper.Map<Blog>(blogCreateDto);

        if (blogCreateDto.Image is not null)
        {
            var checkSendFile = await _fileService.SendFile("Blog/" + user.Result.Email, blogCreateDto.Image!);
            if (checkSendFile.Status == 1)
            {
                blogNew.Image = checkSendFile.Url!;
            }
            else
            {
                return BadRequest(new StatusDto { StatusCode = 0, Message = checkSendFile.Errors });
            }
        }
        blogNew.PosterId = user.Result.Id;
        await _context.Blogs.AddAsync(blogNew);
        await _context.SaveChangesAsync();
        return Ok(new StatusDto { StatusCode = 1, Message = "Created successfully" });
    }

    [HttpGet]
    [Route("get-all")]
    public async Task<IActionResult> GetAll()
    {
        var blogs = await _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).AsNoTracking().OrderByDescending(a => a.Id).ToListAsync();
        if (blogs.Count == 0)
        {
            return NotFound();
        }
        var result = _mapper.Map<List<BlogResponseDto>>(blogs);
        return Ok(result);
    }

    [HttpGet]
    [Route("get-by-id")]
    public async Task<IActionResult> GetById(int id)
    {
        var blog = await _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).AsNoTracking().OrderByDescending(a => a.Id).SingleOrDefaultAsync(a => a.Id == id);
        if (blog is null)
        {
            return NotFound();
        }
        var result = _mapper.Map<BlogResponseDto>(blog);
        return Ok(result);
    }

    [HttpPost]
    [Route("get-by-search")]
    public IActionResult GetBySearch(ParameterSearchDto parameterSearch)
    {
        var blogs = _context.Blogs.Include(a => a.Poster).Include(a => a.Poster.UserRoles).AsNoTracking().AsEnumerable();
        if (parameterSearch.CreatedAt is not null)
        {
            blogs = blogs.Where(a => a.CreatedAt == parameterSearch.CreatedAt);
        }
        if (parameterSearch.ShortTitle?.Length > 0)
        {
            blogs = blogs.Where(a => a.ShortTitle.Contains(parameterSearch.ShortTitle));
        }
        if (parameterSearch.LongTitle?.Length > 0)
        {
            blogs = blogs.Where(a => a.LongTitle.Contains(parameterSearch.LongTitle));
        }
        if (parameterSearch.PosterEmail?.Length > 0)
        {
            blogs = blogs.Where(a => a.Poster.Email == parameterSearch.PosterEmail);
        }
        if (parameterSearch.PosterRole?.Length > 0)
        {
            blogs = blogs.Where(a => a.Poster.UserRoles.Select(a => a.Role!.Name).Contains(parameterSearch.PosterRole));
        }
        if (blogs is null)
        {
            return NotFound();
        }
        blogs = blogs.OrderByDescending(a => a.Id);
        var result = _mapper.Map<List<BlogResponseDto>>(blogs);
        return Ok(result);
    }
}
