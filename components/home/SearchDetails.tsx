"use client";
import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../input/Input";
import Button from "../Button";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { get, isEmpty, map } from "lodash";
import { User, UserDetail } from "@prisma/client";
import UserResult from "./UserResult";
import { useRouter } from "next/navigation";

function SearchDetails({
  userSearchDetails,
  currentUser,
  allUserData
}: {
  userSearchDetails: UserDetail | null;
  currentUser: User | null;
  allUserData: User[]
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [userDataResult, setUserDataResult] = useState([]);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [userSearchDetails]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      detail1: userSearchDetails?.detail1 || "",
      detail2: userSearchDetails?.detail2 || "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!data.detail1) {
      setError("detail1", { type: "required", message: "Field is required!" });
    }
    setIsLoadingSave(true);

    axios
      .post("/api/home/user-details", {
        ...data,
      })
      .then(() => {
        setIsLoadingSave(false);
        router.refresh();
        toast.success("Successfully! saved the details");
      })
      .catch((err) => {
        toast.error("Something went wrong");
        setIsLoading(false);
      })
      .finally(() => setIsLoading(false));
  };

  const handleClickFindUser = async () => {
    setIsLoading(true);
    setUserDataResult([]);
    setShowSearchResult(false);
    let input = [] as string[];
    map(allUserData, (user) => input.push(JSON.stringify(user)))

    axios
      .post("/api/home/search-user", { input })
      .then(async (res) => {
        setIsLoading(false);
        setUserDataResult(res.data.data);
        router.refresh();

        await Promise.all(
          res.data.user.map(async (userData: any) => {
            try {
              const userId = get(userData, "id", "");
              const message = get(userData, "message", "");
              const conversationData = await axios.post("/api/conversations", {
                userId: userId,
              });

              await axios.post("/api/messages", {
                message: message,
                conversationId: conversationData.data.id,
              });
            } catch (error) {
              toast.error("Failed to send message to the resultant users!");
            }
          })
        );

      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Something went wrong")
      })
      .finally(() => {
        setShowSearchResult(true);
      });
  };

  const validatingDetailFormValues = () => {
    const detail1 = watch("detail1");
    const detail2 = watch("detail2");
    if (!detail1.length || !detail2.length) {
      return false;
    }

    return true;
  };

  const checkUserStoredAndLocalValues = () => {
    const detail1 = watch("detail1");
    const detail2 = watch("detail2");
    const validatingUserDetail = validatingDetailFormValues();
    if (!validatingUserDetail) {
      return false;
    }

    if (
      userSearchDetails?.detail1 === detail1 &&
      userSearchDetails?.detail2 === detail2
    ) {
      return true;
    }

    return false;
  };

  const getUserResultJsx = () => {
    if (showSearchResult && !userDataResult.length) {
      return <div>No Result Founds, Please try again!</div>;
    } else if (showSearchResult && userDataResult.length) {
      return (
        <div className="sm:w-3/6">
          <UserResult connectedUser={userDataResult} />
        </div>
      );
    }
  };

  return (
    <div className="px-8 py-4 flex column flex-col gap-2.5 w-full items-center">
      <div className="text-xl sm:w-3/6">Search Details</div>
      <div className="bg-white dark:bg-black shadow sm:rounded-lg p-4 w-full sm:p-10 sm:w-3/6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <Input
              label="Detail 1"
              id="detail1"
              type="text"
              required={true}
              register={register}
              errors={errors}
            />
            <Input
              label="Detail 2"
              id="detail2"
              type="text"
              required={true}
              register={register}
              errors={errors}
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button
              className="w-20"
              type="submit"
              disabled={!validatingDetailFormValues()}
            >
              {isLoadingSave ? <ClipLoader size={20} /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
      <div className="flex justify-center sm:w-3/6">
        <Button
          className="w-40"
          onClick={handleClickFindUser}
          disabled={
            isEmpty(userSearchDetails) ||
            (currentUser?.token === 0) ||
            !checkUserStoredAndLocalValues()
          }
        >
          {isLoading ? <>Loading &nbsp; <ClipLoader size={20} /> </> : "Find User"}
        </Button>
      </div>
      {getUserResultJsx()}
    </div>
  );
}

export default SearchDetails;
