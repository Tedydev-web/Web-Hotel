using AutoMapper;
using Database.Models;
using DataBase.Models;
using WebHotel.Controllers.AdminController;
using WebHotel.Controllers.UserController;
using WebHotel.DTO;
using WebHotel.DTO.AccountDtos;
using WebHotel.DTO.BlogDtos;
using WebHotel.DTO.DiscountDtos;
using WebHotel.DTO.DiscountReservationDetailDtos;
using WebHotel.DTO.DiscountRoomDetailDtos;
using WebHotel.DTO.DiscountServiceDetailDtos;
using WebHotel.DTO.DiscountTypeDtos;
using WebHotel.DTO.PaymentDtos;
using WebHotel.DTO.ReservationDtos;
using WebHotel.DTO.ReservationPayment;
using WebHotel.DTO.RoomDtos;
using WebHotel.DTO.RoomStarDtos;
using WebHotel.DTO.RoomTypeDtos;
using WebHotel.DTO.ServiceAttachDetailDtos;
using WebHotel.DTO.ServiceAttachDtos;
using WebHotel.DTO.TokenDtos;
using WebHotel.DTO.UserDtos;

namespace WebHotel.Helper
{
    public class ApplicationMapper : Profile
    {
        public ApplicationMapper()
        {
            CreateMap<TokenRequestDto, TokenResponseDto>().ReverseMap();

            CreateMap<UserProfileRequestDto, ApplicationUser>().ReverseMap();

            CreateMap<UserProfileResponseDto, ApplicationUser>().ReverseMap();

            CreateMap<RoomResponseDto, Room>().ReverseMap();
            CreateMap<RoomResponseTopRevenueDto, Room>().ReverseMap();

            CreateMap<RoomRequestDto, Room>().ReverseMap();

            CreateMap<RoomStarRequestDto, RoomStar>().ReverseMap();

            CreateMap<RoomTypeRequestDto, RoomType>().ReverseMap();

            CreateMap<RoomTypeResponseDto, RoomType>().ReverseMap();

            CreateMap<ReservationCreateDto, Reservation>().ReverseMap();

            CreateMap<DiscountRequestDto, Discount>().ReverseMap();

            CreateMap<DiscountRoomDetailRequest, DiscountRoomDetail>().ReverseMap();

            CreateMap<DiscountReservationDetailRequest, DiscountReservationDetail>().ReverseMap();

            CreateMap<DiscountServiceDetailRequest, DiscountServiceDetail>().ReverseMap();

            CreateMap<DiscountUpdateDto, Discount>().ReverseMap();

            CreateMap<DiscountResponseDto, Discount>()
                .ReverseMap()
                .ForMember(
                    destination => destination.NameType,
                    options => options.MapFrom(source => source.DiscountType.Name)
                )
                .ForMember(
                    destination => destination.Email,
                    options => options.MapFrom(source => source.Creator.Email)
                )
                .ForMember(
                    destination => destination.Roles,
                    options =>
                        options.MapFrom(
                            source => source.Creator.UserRoles.Select(a => a.Role!.Name).ToList()
                        )
                );

            CreateMap<DiscountType, DiscountTypeResponseDto>().ReverseMap();

            CreateMap<ServiceAttach, ServiceAttachRequestDto>().ReverseMap();

            CreateMap<ServiceAttachResponseDto, ServiceAttach>().ReverseMap();

            CreateMap<ServiceAttachDetail, ServiceAttachDetailRequestDto>().ReverseMap();

            CreateMap<ServiceAttachDetailResponseDto, ServiceAttachDetail>().ReverseMap();

            CreateMap<Notification, NotificationResponseDto>().ReverseMap();

            CreateMap<Notification, NotificationCreateDto>()
                .ReverseMap()
                .ForMember(d => d.NotificationType, o => o.MapFrom(s => (int)s.NotificationType));

            CreateMap<ReservationPayment, PaymentRequestFullDto>().ReverseMap();

            CreateMap<Blog, BlogCreateDto>().ReverseMap();

            CreateMap<BlogResponseDto, Blog>()
                .ReverseMap()
                .ForMember(d => d.PosterEmail, o => o.MapFrom(source => source.Poster.Email))
                .ForMember(
                    d => d.PosterRoles,
                    o =>
                        o.MapFrom(
                            source => source.Poster.UserRoles.Select(a => a.Role!.Name).ToList()
                        )
                );

            CreateMap<AccountResponseDto, ApplicationUser>()
                .ReverseMap()
                .ForMember(
                    d => d.Roles,
                    o => o.MapFrom(source => source.UserRoles.Select(a => a.Role!.Name).ToList())
                );

            CreateMap<AccountResponseTopDto, ApplicationUser>()
                .ReverseMap()
                .ForMember(
                    d => d.Roles,
                    o => o.MapFrom(source => source.UserRoles.Select(a => a.Role!.Name).ToList())
                );

            CreateMap<ApplicationRole, RoleResponseDto>().ReverseMap();

            CreateMap<ApplicationRole, RoleCreateDto>().ReverseMap();

            CreateMap<ReservationResponseAdminDto, Reservation>()
                .ReverseMap()
                .ForMember(a => a.RoomNumber, o => o.MapFrom(a => a.Room.RoomNumber))
                .ForMember(a => a.UserName, o => o.MapFrom(a => a.User.UserName))
                .ForMember(a => a.Status, o => o.MapFrom(a => a.ReservationPayment.Status))
                .ForMember(a => a.ReservationPayment, o => o.MapFrom(a => a.ReservationPayment));

            CreateMap<ReservationResponseDto, Reservation>()
                .ReverseMap()
                .ForMember(a => a.RoomNumber, o => o.MapFrom(a => a.Room.RoomNumber))
                .ForMember(a => a.UserName, o => o.MapFrom(a => a.User.UserName))
                .ForMember(a => a.Status, o => o.MapFrom(a => a.ReservationPayment.Status))
                .ForMember(a => a.ReservationPayment, o => o.MapFrom(a => a.ReservationPayment));

            CreateMap<ReservationPayment, ReservationPaymentResponseDto>().ReverseMap();

            CreateMap<ReservationPayment, ReservationPaymentResponseInvoiceDto>().ReverseMap();

            CreateMap<ServiceRoom, ServiceRoomCreateDto>().ReverseMap();

            CreateMap<ServiceRoom, ServiceRoomResponseDto>().ReverseMap();

            CreateMap<Reservation, InfoEditReservationDto>().ReverseMap();

            CreateMap<Reservation, ReservationGetByIdDto>().ReverseMap();

            CreateMap<Reservation, ReservationResponseInvoiceDto>().ReverseMap();

            CreateMap<InvoiceResponse, InvoiceReservation>()
                .ReverseMap()
                .ForMember(d => d.Email, o => o.MapFrom(source => source.Creator.Email));

            CreateMap<OrderServiceResponseDto, OrderService>()
                .ReverseMap()
                .ForMember(d => d.CreatorEmail, o => o.MapFrom(s => s.User.Email));
        }
    }
}
